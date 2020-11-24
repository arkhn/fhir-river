from sqlalchemy import (
    and_,
    Column as AlchemyColumn,
    Table,
)
from sqlalchemy.orm import (
    aliased,
    Query,
)
from typing import Callable, Dict

from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.sql_column import SqlColumn
from extractor.src.config.service_logger import logger
from extractor.src.errors import ImproperMappingError

from arkhn_monitoring import Timer


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

        # We don't need to have condition columns duplicated in the dataframe
        # so we keep the one we've already seen here.
        self._condition_columns = set()

        # To avoid duplciated joins, we keep them here
        self._cur_query_join_tables = {}

    @Timer("time_extractor_build_query", "time to build sql query")
    def build_query(self) -> Query:
        """ Builds an sql alchemy query which will be run in run_sql_query.
        """
        logger.info(
            f"Start building query for resource {self.analysis.definition_id}",
            extra={"resource_id": self.analysis.resource_id},
        )

        # Check that temp attributes are empty
        self._condition_columns = set()
        self._cur_query_join_tables = {}

        query = self.session.query(
            self.get_column(self.analysis.primary_key_column, self._sqlalchemy_pk_table)
        )

        # Add attributes to query
        for attribute in self.analysis.attributes:
            query = self.add_attribute_to_query(query, attribute)

        # Add filters to query
        query = self.apply_filters(query)

        logger.info(
            f"Built query for resource {self.analysis.definition_id}: {query.statement}",
            extra={"resource_id": self.analysis.resource_id},
        )
        return query

    def add_attribute_to_query(self, query: Query, attribute: Attribute):
        for input_group in attribute.input_groups:
            for col in input_group.columns:

                # Apply joins to the query
                # We keep the used join tables in a dict in case we have multi-hop joins
                join_tables = {}
                for join in col.joins:
                    if join in self._cur_query_join_tables:
                        # This join was already added to the query
                        continue

                    # Get tables
                    right_table = join_tables.get(join.right.table, self.get_table(join.right))
                    left_table = join_tables.get(join.left.table, self.get_table(join.left))
                    join_tables[join.right.table] = right_table
                    join_tables[join.left.table] = left_table

                    # Add the join to the temp join dict
                    self._cur_query_join_tables[join] = right_table

                    # Add join
                    query = query.join(
                        right_table,
                        self.get_column(join.right, right_table)
                        == self.get_column(join.left, left_table),
                        isouter=True,
                    )

                # Add the column to select to the query
                if col.joins:
                    # The last join will be the one on the input table
                    sqlalchemy_table = self._cur_query_join_tables[col.joins[-1]]
                else:
                    with_alias = len(col.joins) > 0
                    sqlalchemy_table = self.get_table(col, with_alias=with_alias)
                sqlalchemy_col = self.get_column(col, sqlalchemy_table)
                query = query.add_columns(sqlalchemy_col)

            # Add the condition columns to the query
            for condition in input_group.conditions:
                if condition.sql_column.table != self.analysis.primary_key_column.table:
                    # TODO handle conditions with joins:
                    # https://github.com/arkhn/fhir-river/issues/169
                    raise ValueError(
                        f"Cannot use a condition with a column that does not belong "
                        f"to the primary key table: {condition.sql_column.table}"
                    )
                if condition.sql_column in self._condition_columns:
                    # As we currently don't process conditions columns, we don't need to have them
                    # duplicated in the resulting dataframe.
                    continue
                sqlalchemy_table = self.get_table(condition.sql_column, with_alias=False)
                sqlalchemy_col = self.get_column(condition.sql_column, sqlalchemy_table)
                query = query.add_columns(sqlalchemy_col)

                # Add the condition columns to the _condition_columns attribute
                self._condition_columns.add(condition.sql_column)

        return query

    def apply_filters(self, query: Query) -> Query:
        """ Augment the sql alchemy query with filters from the analysis.
        """
        if self.pk_values is not None:
            sqlalchemy_pk_column = self.get_column(self.analysis.primary_key_column)
            if len(self.pk_values) == 1:
                query = query.filter(sqlalchemy_pk_column == self.pk_values[0])
            else:
                query = query.filter(sqlalchemy_pk_column.in_(self.pk_values))

        for sql_filter in self.analysis.filters:
            col = self.get_column(sql_filter.sql_column)
            filter_clause = SQL_RELATIONS_TO_METHOD[sql_filter.relation](col, sql_filter.value)
            query = query.filter(filter_clause)

        return query

    def get_column(self, column: SqlColumn, table: Table = None) -> AlchemyColumn:
        """ Get the sql alchemy column corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        # Note that we label the column manually to avoid collisions and
        # sqlAlchemy automatic labelling
        if table is None:
            table = self.get_table(column)
        try:
            return table.c[column.column].label(column.dataframe_column_name())
        except KeyError:
            # If column.column is not in table.c it may be because the column names are case
            # insensitive. If so, the schema can be in upper case (what oracle considers as
            # case insensitive) but the keys in table.c are in lower case (what sqlalchemy
            # considers as case insensitive).
            try:
                return table.c[column.column.lower()].label(column.dataframe_column_name())
            except KeyError:
                raise ImproperMappingError(
                    f"Column '{column.column}' not found in table '{column.table}'."
                )

    def get_table(self, column: SqlColumn, with_alias: bool = True) -> Table:
        """ Get the sql alchemy table corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        if self.analysis.primary_key_column.table == column.table:
            return self._sqlalchemy_pk_table

        table = Table(
            column.table, self.metadata, schema=column.owner, keep_existing=True, autoload=True,
        )
        return aliased(table) if with_alias else table
