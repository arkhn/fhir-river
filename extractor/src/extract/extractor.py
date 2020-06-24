from collections import defaultdict
from typing import List

from sqlalchemy import create_engine, func, distinct, MetaData, Table, Column as AlchemyColumn
from sqlalchemy.orm import sessionmaker, Query

from analyzer.src.analyze.sql_column import SqlColumn
from analyzer.src.analyze.sql_join import SqlJoin

from extractor.src.config.logger import create_logger
from extractor.src.errors import EmptyResult

logger = create_logger("extractor")

SQL_RELATIONS_TO_METHOD = {
    "<": "__lt__",
    "<=": "__le__",
    "<>": "__ne__",
    "=": "__eq__",
    ">": "__gt__",
    ">=": "__ge__",
    # not handled yet
    # "BETWEEN": "",
    "IN": "in_",
    "LIKE": "like",
}
DB_DRIVERS = {"POSTGRES": "postgresql", "ORACLE": "oracle+cx_oracle"}


class Extractor:
    def __init__(self):
        self.db_string = None
        self.engine = None
        self.metadata = None
        self.session = None

    @staticmethod
    def build_db_url(credentials):
        login = credentials["login"]
        password = credentials["password"]
        host = credentials["host"]
        port = credentials["port"]
        database = credentials["database"]

        try:
            db_handler = DB_DRIVERS[credentials["model"]]
        except KeyError:
            raise ValueError(
                "credentials specifies the wrong database model. "
                "Only 'POSTGRES' and 'ORACLE' are currently supported."
            )

        return f"{db_handler}://{login}:{password}@{host}:{port}/{database}"

    def update_connection(self, credentials):
        new_db_string = self.build_db_url(credentials)
        logger.debug("Updating connection to %s", new_db_string)

        if new_db_string != self.db_string:
            self.db_string = new_db_string
            self.engine = create_engine(self.db_string)
            self.metadata = MetaData(bind=self.engine)
            self.session = sessionmaker(self.engine)()

    def extract(self, resource_mapping, analysis, pk_values=None):
        """ Main method of the Extractor class.
        It builds the sql alchemy query that will fetch the columns needed from the
        source DB, run it and returns the result as an sqlalchemy RestulProxy.

        Args:
            resource_mapping: the mapping.
            analysis: an Analyis instance built by the Analyzer.
            pk_values: it not None, the Extractor will fetch only the rows for which
                the primary key values are in pk_values.

        Returns:
            a an sqlalchemy RestulProxy containing all the columns asked for in the mapping
        """
        if self.session is None:
            raise ValueError(
                "You need to create a session for the Extractor before using extract()."
            )

        logger.info(f"Extracting resource: {resource_mapping['definitionId']}")

        # Build sqlalchemy query
        query = self.sqlalchemy_query(
            analysis.columns,
            analysis.joins,
            analysis.primary_key_column,
            resource_mapping,
            pk_values,
        )

        return self.run_sql_query(query)

    def sqlalchemy_query(
        self,
        columns: List[SqlColumn],
        joins: List[SqlJoin],
        pk_column: SqlColumn,
        resource_mapping,
        pk_values,
    ) -> Query:
        """ Builds an sql alchemy query which will be run in run_sql_query.
        """
        alchemy_cols = self.get_columns(columns)
        base_query = self.session.query(*alchemy_cols)
        query_w_joins = self.apply_joins(base_query, joins)
        query_w_filters = self.apply_filters(query_w_joins, resource_mapping, pk_column, pk_values)

        return query_w_filters

    def apply_joins(self, query: Query, joins: List[SqlJoin]) -> Query:
        """ Augment the sql alchemy query with joins from the analysis.
        """
        for join in joins:
            foreign_table = self.get_table(join.right)
            query = query.join(
                foreign_table,
                self.get_column(join.right) == self.get_column(join.left),
                isouter=True,
            )
        return query

    def apply_filters(
        self, query: Query, resource_mapping, pk_column: SqlColumn, pk_values
    ) -> Query:
        """ Augment the sql alchemy query with filters from the analysis.
        """
        if pk_values is not None:
            query = query.filter(self.get_column(pk_column).in_(pk_values))

        if resource_mapping["filters"]:
            for filter in resource_mapping["filters"]:
                col = self.get_column(
                    SqlColumn(
                        filter["sqlColumn"]["table"],
                        filter["sqlColumn"]["column"],
                        filter["sqlColumn"]["owner"],
                    )
                )
                rel_method = SQL_RELATIONS_TO_METHOD[filter["relation"]]
                query = query.filter(getattr(col, rel_method)(filter["value"]))

        return query

    def run_sql_query(self, query):
        """
        Run a sql query after opening a sql connection

        args:
            query (str): a sql query to run
            connection_type (str): the connection type / database to use

        return:
            the result of the sql query
        """
        query = query.statement
        logger.info(f"sql query: {query}")

        return self.session.execute(query)

    def batch_size(self, analysis, resource_mapping) -> int:
        pk_column = self.get_column(analysis.primary_key_column)
        base_query = self.session.query(func.count(distinct(pk_column)))
        query_w_joins = self.apply_joins(base_query, analysis.joins)
        query_w_filters = self.apply_filters(query_w_joins, resource_mapping, pk_column, None)
        logger.info(f"sql query: {query_w_filters.statement}")
        res = query_w_filters.session.execute(query_w_filters)

        return res.scalar()

    def get_columns(self, columns: List[SqlColumn]) -> List[AlchemyColumn]:
        """ Get the sql alchemy columns corresponding to the SqlColumns (custom type)
        from the analysis.
        """
        return [self.get_column(col) for col in columns]

    def get_column(self, column: SqlColumn) -> AlchemyColumn:
        """ Get the sql alchemy column corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        table = self.get_table(column)
        # Note that we label the column manually to avoid collisions and
        # sqlAlchemy automatic labelling
        return table.c[column.column].label(column.dataframe_column_name())

    def get_table(self, column: SqlColumn) -> Table:
        """ Get the sql alchemy table corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        return Table(
            column.table, self.metadata, schema=column.owner, keep_existing=True, autoload=True,
        )

    @staticmethod
    def split_dataframe(df, analysis):
        # Find primary key column
        logger.debug("Splitting Dataframe")
        # TODO I don't think it's necessarily present in the df
        pk_col = analysis.primary_key_column.dataframe_column_name()

        prev_pk_val = None
        acc = defaultdict(list)
        for row in df:
            if acc and row[pk_col] != prev_pk_val:
                yield acc
                acc = defaultdict(list)
            for key, value in row.items():
                acc[key].append(value)
            prev_pk_val = row[pk_col]

        if not acc:
            raise EmptyResult(
                "The sql query returned nothing. Maybe the primary key values "
                "you provided are not present in the database or the mapping "
                "is erroneous."
            )
        yield acc
