import logging
from typing import Callable, Dict

from arkhn_monitoring import Timer
from common.analyzer.attribute import Attribute
from common.analyzer.sql_column import SqlColumn
from extractor.errors import ImproperMappingError
from sqlalchemy import Column as AlchemyColumn
from sqlalchemy import Table, and_
from sqlalchemy.orm import Query, aliased

logger = logging.getLogger(__name__)


def handle_between_filter(col, value):
    values = value.split(",")
    if len(values) != 2:
        raise ValueError("BETWEEN filter expects 2 values separated by a comma.")
    min_val = values[0].strip()
    max_val = values[1].strip()
    return and_(col.__ge__(min_val), col.__le__(max_val))


SQL_RELATIONS_TO_METHOD: Dict[str, Callable[[AlchemyColumn, str], Callable]] = {
    "<": lambda col, value: col.__lt__(value),
    "<=": lambda col, value: col.__le__(value),
    "<>": lambda col, value: col.__ne__(value),
    "=": lambda col, value: col.__eq__(value),
    ">": lambda col, value: col.__gt__(value),
    ">=": lambda col, value: col.__ge__(value),
    "BETWEEN": handle_between_filter,
    "IN": lambda col, value: col.in_(value.split(",")),
    "LIKE": lambda col, value: col.like(value),
}


class QueryBuilder:
    def __init__(self, session, metadata, analysis, pk_values):
        self.session = session
        self.metadata = metadata
        self.analysis = analysis
        self.pk_values = pk_values

        # The PK table has no reason to be aliased so we keep it here
        self._sqlalchemy_pk_table = Table(
            self.analysis.primary_key_column.table,
            self.metadata,
            schema=self.analysis.primary_key_column.owner,
            keep_existing=True,
            autoload=True,
        )

    @Timer("time_extractor_build_query", "time to build sql query")
    def build_query(self) -> Query:
        """Builds an sql alchemy query which will be run in run_sql_query."""
        logger.info(
            {
                "message": f"Start building query for resource {self.analysis.definition_id}",
                "resource_id": self.analysis.resource_id,
            },
        )

        # We don't need to have columns duplicated in the dataframe
        # so we keep the one we've already seen here.
        # Note that the primary key column is added at the query initialization.
        self._cur_query_columns = {self.analysis.primary_key_column}
        # To avoid duplicated joins, we keep them here
        self._cur_query_join_tables = {}

        query = self.session.query(self.get_column(self.analysis.primary_key_column, self._sqlalchemy_pk_table))

        # Add attributes to query
        for attribute in self.analysis.attributes:
            query = self.add_attribute_to_query(query, attribute)

        # Add filters to query
        query = self.apply_filters(query)

        logger.info(
            {
                "message": f"Built query for resource {self.analysis.definition_id}: {query.statement}",
                "resource_id": self.analysis.resource_id,
            },
        )
        return query

    def add_attribute_to_query(self, query: Query, attribute: Attribute):
        for input_group in attribute.input_groups:
            for col in input_group.columns:

                if col.joins:
                    query = self.augment_query_with_joins(query, col.joins)
                    # We need to use the right sqlalchemy table for the input:
                    # If there is a join on this attribute, we need to use the same
                    # table as in the joins. The last join will be the one on the input
                    # table
                    sqlalchemy_table = self._cur_query_join_tables[col.joins[-1]]
                else:
                    # Otherwise, it's the primary table and we don't need to alias it
                    sqlalchemy_table = self.get_table(col, with_alias=False)

                query = self.add_column_to_query(col, sqlalchemy_table, query)

            # Add the condition columns to the query
            for condition in input_group.conditions:

                if condition.sql_column.joins:
                    query = self.augment_query_with_joins(query, condition.sql_column.joins)
                    # We need to use the right sqlalchemy table for the input:
                    # If there is a join on this attribute, we need to use the same
                    # table as in the joins. The last join will be the one on the input
                    # table
                    sqlalchemy_table = self._cur_query_join_tables[condition.sql_column.joins[-1]]
                else:
                    # Otherwise, it's the primary table and we don't need to alias it
                    sqlalchemy_table = self.get_table(condition.sql_column, with_alias=False)

                query = self.add_column_to_query(condition.sql_column, sqlalchemy_table, query)

        return query

    def add_column_to_query(self, sql_column: SqlColumn, sqlalchemy_table: Table, query: Query):
        """Helper function to add a column to the sqlalchemy query if it is not already
        present and to add the column to the set of columns already present in the
        query.
        """
        if sql_column in self._cur_query_columns:
            return query

        sqlalchemy_col = self.get_column(sql_column, sqlalchemy_table)

        # Add the column to the _cur_query_columns attribute
        self._cur_query_columns.add(sql_column)

        return query.add_columns(sqlalchemy_col)

    def apply_filters(self, query: Query) -> Query:
        """Augment the sql alchemy query with filters from the analysis."""
        if self.pk_values is not None:
            sqlalchemy_pk_column = self.get_column(self.analysis.primary_key_column)
            if len(self.pk_values) == 1:
                query = query.filter(sqlalchemy_pk_column == self.pk_values[0])
            else:
                query = query.filter(sqlalchemy_pk_column.in_(self.pk_values))

        for sql_filter in self.analysis.filters:
            if sql_filter.sql_column.joins:
                query = self.augment_query_with_joins(query, sql_filter.sql_column.joins)
                # We need to use the right sqlalchemy table for the input:
                # If there is a join on this attribute, we need to use the same table
                # as in the joins. The last join will be the one on the input table
                sqlalchemy_table = self._cur_query_join_tables[sql_filter.sql_column.joins[-1]]
            else:
                # Otherwise, it's the primary table and we don't need to alias it
                sqlalchemy_table = self.get_table(sql_filter.sql_column, with_alias=False)

            col = self.get_column(sql_filter.sql_column, sqlalchemy_table)
            filter_clause = SQL_RELATIONS_TO_METHOD[sql_filter.relation](col, sql_filter.value)
            query = query.filter(filter_clause)

        return query

    def augment_query_with_joins(self, query, analysis_joins):
        # If we have a multi-hop join, the tables for all the joins should look like
        # A-B, B-C, C-D where B and C are "link tables".
        last_link = None
        for join in analysis_joins:
            if join in self._cur_query_join_tables:
                # This join was already added to the query
                # but we still store it in last_link in case we have a multi-hop join
                last_link = self._cur_query_join_tables[join]
                continue

            # Get tables
            left_table = last_link if last_link is not None else self.get_table(join.left)
            right_table = self.get_table(join.right)
            last_link = right_table

            # Add the join to the temp join dict
            self._cur_query_join_tables[join] = right_table

            # Add join
            query = query.join(
                right_table,
                self.get_column(join.right, right_table) == self.get_column(join.left, left_table),
                isouter=True,
            )

        return query

    def get_column(self, column: SqlColumn, table: Table = None) -> AlchemyColumn:
        """Get the sql alchemy column corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        # Note that we label the column manually to avoid collisions and
        # sqlAlchemy automatic labelling
        if table is None:
            table = self.get_table(column)
        try:
            return table.c[column.column].label(column.dataframe_column_name())
        except KeyError:
            # If column.column is not in table.c it may be because the column names are
            # case insensitive. If so, the schema can be in upper case (what oracle
            # considers as case insensitive) but the keys in table.c are in lower case
            # (what sqlalchemy considers as case insensitive).
            try:
                return table.c[column.column.lower()].label(column.dataframe_column_name())
            except KeyError:
                raise ImproperMappingError(f"Column '{column.column}' not found in table '{column.table}'.")

    def get_table(self, column: SqlColumn, with_alias: bool = True) -> Table:
        """Get the sql alchemy table corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        if self.analysis.primary_key_column.table == column.table:
            return self._sqlalchemy_pk_table

        table = Table(
            column.table,
            self.metadata,
            schema=column.owner,
            keep_existing=True,
            autoload=True,
        )
        return aliased(table) if with_alias else table
