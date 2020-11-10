from sqlalchemy import (
    and_,
    Column as AlchemyColumn,
    distinct,
    func,
    Table,
)
from sqlalchemy.orm import (
    aliased,
    Query,
)
from typing import Callable, Dict

from analyzer.src.analyze.analysis import Analysis
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
    def __init__(self, extractor, analysis, pk_values):
        self.extractor = extractor
        self.analysis = analysis
        self.pk_values = pk_values

        # The PK table has no reason to be aliased so we keep it here
        self._sqlalchemy_pk_table = Table(
            self.analysis.primary_key_column.table,
            self.extractor.metadata,
            schema=self.analysis.primary_key_column.owner,
            keep_existing=True,
            autoload=True,
        )

    @Timer("time_extractor_build_query", "time to build sql query")
    def build_query(self) -> Query:
        """ Builds an sql alchemy query which will be run in run_sql_query.
        """
        logger.info(
            f"Start building query for resource {self.analysis.definition_id}",
            extra={"resource_id": self.analysis.resource_id},
        )

        query = self.extractor.session.query(
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

    def batch_size(self, analysis: Analysis) -> int:
        logger.info(
            f"Start computing batch size for resource {analysis.definition_id}",
            extra={"resource_id": analysis.resource_id},
        )

        sqlalchemy_pk_column = self.get_column(self.analysis.primary_key_column)
        query = self.session.query(func.count(distinct(sqlalchemy_pk_column)))

        # Add filters to query
        query = self.apply_filters(query)

        logger.info(
            f"Sql query to compute batch size: {query.statement}",
            extra={"resource_id": analysis.resource_id},
        )
        res = self.extractor.session.execute(query)

        return res.scalar()

    def add_attribute_to_query(self, query: Query, attribute: Attribute):
        for input_group in attribute.input_groups:
            for col in input_group.columns:
                # Add the column to select to the query
                sqlalchemy_table = self.get_table(col)
                sqlalchemy_col = self.get_column(col, sqlalchemy_table)
                query = query.add_columns(sqlalchemy_col)

                # Apply joins to the query
                for join in col.joins:
                    right_table = sqlalchemy_table if col.table == join.right.table else None
                    query = query.join(
                        sqlalchemy_table,
                        self.get_column(join.right, right_table) == self.get_column(join.left),
                        isouter=True,
                    )

            # Add the condition columns to the query
            for condition in input_group.conditions:
                query = query.add_columns(condition.sql_column)

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

    def get_table(self, column: SqlColumn) -> Table:
        """ Get the sql alchemy table corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        if self.analysis.primary_key_column.table == column.table:
            return self._sqlalchemy_pk_table

        table = Table(
            column.table,
            self.extractor.metadata,
            schema=column.owner,
            keep_existing=True,
            autoload=True,
        )
        return aliased(table)
