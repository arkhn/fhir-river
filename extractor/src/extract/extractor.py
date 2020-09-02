from collections import defaultdict
from typing import List

from sqlalchemy import create_engine, func, distinct, MetaData, Table, Column as AlchemyColumn
from sqlalchemy.orm import sessionmaker, Query

from analyzer.src.analyze.analysis import Analysis
from analyzer.src.analyze.sql_column import SqlColumn
from analyzer.src.analyze.sql_join import SqlJoin

from extractor.src.config.logger import get_logger
from extractor.src.errors import EmptyResult, ImproperMappingError

from arkhn_monitoring import Timer


logger = get_logger()

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

MSSQL = "MSSQL"
ORACLE = "ORACLE"
POSTGRES = "POSTGRES"
DB_DRIVERS = {POSTGRES: "postgresql", ORACLE: "oracle+cx_oracle", MSSQL: "mssql+pyodbc"}
URL_SUFFIXES = {POSTGRES: "", ORACLE: "", MSSQL: "?driver=ODBC+Driver+17+for+SQL+Server"}


class Extractor:
    def __init__(self):
        self.db_string = None
        self.engine = None
        self.metadata = None
        self.session = None

    @staticmethod
    def build_db_url(credentials):
        model = credentials["model"]
        login = credentials["login"]
        password = credentials["password"]
        host = credentials["host"]
        port = credentials["port"]
        database = credentials["database"]

        try:
            db_handler = DB_DRIVERS[model]
            url_suffix = URL_SUFFIXES[model]
        except KeyError:
            raise ValueError(
                "credentials specifies the wrong database model. "
                "Only 'POSTGRES', 'ORACLE' and 'MSSQL' are currently supported."
            )

        return f"{db_handler}://{login}:{password}@{host}:{port}/{database}{url_suffix}"

    def update_connection(self, credentials):
        new_db_string = self.build_db_url(credentials)
        logger.info(f"Updating connection to database {credentials['database']}")

        if new_db_string != self.db_string:
            self.db_string = new_db_string
            # Setting pool_pre_ping to True avoids random connection closing
            self.engine = create_engine(self.db_string, pool_pre_ping=True)
            self.metadata = MetaData(bind=self.engine)
            self.session = sessionmaker(self.engine)()

    # TODO refine buckets if needed
    @Timer("time_extractor_extract", "time to perform extract method of Extractor")
    def extract(self, analysis, pk_values=None):
        """ Main method of the Extractor class.
        It builds the sql alchemy query that will fetch the columns needed from the
        source DB, run it and returns the result as an sqlalchemy ResultProxy.

        Args:
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

        logger.info(
            f"Extracting resource: {analysis.definition_id}",
            extra={"resource_id": analysis.resource_id},
        )

        # Build sqlalchemy query
        query = self.sqlalchemy_query(analysis, pk_values)

        return self.run_sql_query(query)

    @Timer("time_extractor_build_query", "time to build sql query")
    def sqlalchemy_query(self, analysis: Analysis, pk_values) -> Query:
        """ Builds an sql alchemy query which will be run in run_sql_query.
        """
        alchemy_cols = self.get_columns(analysis.columns)
        base_query = self.session.query(*alchemy_cols)
        query_w_joins = self.apply_joins(base_query, analysis.joins)
        query_w_filters = self.apply_filters(query_w_joins, analysis, pk_values)

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

    def apply_filters(self, query: Query, analysis: Analysis, pk_values) -> Query:
        """ Augment the sql alchemy query with filters from the analysis.
        """
        if pk_values is not None:
            query = query.filter(self.get_column(analysis.primary_key_column).in_(pk_values))

        for sql_filter in analysis.filters:
            col = self.get_column(sql_filter.sql_column)
            rel_method = SQL_RELATIONS_TO_METHOD[sql_filter.relation]
            query = query.filter(getattr(col, rel_method)(sql_filter.value))

        return query

    @Timer("time_extractor_run_query", "time to run sql query")
    def run_sql_query(self, query, resource_id=None):
        """
        Run a sql query after opening a sql connection

        args:
            query (str): a sql query to run
            resource_id (str, optional): the id of the resource being processed, for logging

        return:
            the result of the sql query
        """
        query = query.statement
        logger.info(f"sql query: {query}", extra={"resource_id": resource_id})

        return self.session.execute(query)

    def batch_size(self, analysis) -> int:
        pk_column = self.get_column(analysis.primary_key_column)
        base_query = self.session.query(func.count(distinct(pk_column)))
        query_w_joins = self.apply_joins(base_query, analysis.joins)
        query_w_filters = self.apply_filters(query_w_joins, analysis, None)
        logger.info(
            f"sql query: {query_w_filters.statement}", extra={"resource_id": analysis.resource_id}
        )
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
        try:
            return table.c[column.column].label(column.dataframe_column_name())
        except KeyError:
            raise ImproperMappingError(
                f"Column '{column.column}' not found in table '{column.table}'."
            )

    def get_table(self, column: SqlColumn) -> Table:
        """ Get the sql alchemy table corresponding to the SqlColumn (custom type)
        from the analysis.
        """
        return Table(
            column.table, self.metadata, schema=column.owner, keep_existing=True, autoload=True,
        )

    @staticmethod
    @Timer("time_extractor_split", "time to split dataframe")
    def split_dataframe(df, analysis):
        # Find primary key column
        logger.debug("Splitting Dataframe", extra={"resource_id": analysis.resource_id})
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
