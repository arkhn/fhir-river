import logging
from collections import defaultdict
from prometheus_client import Counter as PromCounter
from sqlalchemy import (
    create_engine,
    MetaData,
)
from sqlalchemy.orm import (
    sessionmaker,
    Query,
)
from typing import List, Any, Optional

from common.analyzer.analysis import Analysis
from extractor.errors import EmptyResult
from extractor.extract.query_builder import QueryBuilder

from arkhn_monitoring import Timer


logger = logging.getLogger(__name__)

MSSQL = "MSSQL"
ORACLE = "ORACLE"
POSTGRES = "POSTGRES"
DB_DRIVERS = {POSTGRES: "postgresql", ORACLE: "oracle+cx_oracle", MSSQL: "mssql+pyodbc"}
URL_SUFFIXES = {
    POSTGRES: "",
    ORACLE: "",
    # the param MARS_Connection=Yes solves the following issue:
    # https://github.com/catherinedevlin/ipython-sql/issues/54
    MSSQL: "?driver=ODBC+Driver+17+for+SQL+Server&MARS_Connection=Yes",
}

# CHUNK_SIZE is the argument we give to sqlalchemy's Query.yield_per
# Rows will be loaded by batches of length CHUNK_SIZE. This avoids
# filling up all the RAM with huge tables.
CHUNK_SIZE = 10_000

counter_extract_instances = PromCounter(
    "count_extracted_instances",
    "Number of resource instances extracted",
    labelnames=("resource_id", "resource_type"),
)


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

    @Timer("time_extractor_extract", "time to perform extract method of Extractor")
    def extract(self, analysis: Analysis, pk_values: Optional[List[Any]] = None):
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
            f"Start extracting resource: {analysis.definition_id}",
            extra={"resource_id": analysis.resource_id},
        )

        # Build sqlalchemy query
        builder = QueryBuilder(
            session=self.session, metadata=self.metadata, analysis=analysis, pk_values=pk_values
        )
        query = builder.build_query()

        return self.run_sql_query(query)

    @Timer("time_extractor_run_query", "time to run sql query")
    def run_sql_query(self, query: Query, resource_id: Optional[str] = None):
        """
        Run a sql query after opening a sql connection

        args:
            query (str): a sql query to run
            resource_id (str, optional): the id of the resource being processed, for logging

        return:
            the result of the sql query
        """
        logger.info(f"Executing query: {query.statement}", extra={"resource_id": resource_id})

        return query.yield_per(CHUNK_SIZE)

    @staticmethod
    @Timer("time_extractor_split", "time to split dataframe")
    def split_dataframe(df: Query, analysis: Analysis):
        # TODO maybe this could be replaced by a group_by?
        # Find primary key column
        logger.info(
            f"Splitting dataframe for resource {analysis.definition_id}",
            extra={"resource_id": analysis.resource_id},
        )

        pk_col = analysis.primary_key_column.dataframe_column_name()

        prev_pk_val = None
        acc = defaultdict(list)
        for row in df:
            # When iterating on a sqlalchemy Query, we get rows (actually sqlalchemy results)
            # that behaves like tuples and have a `keys` methods returning the
            # column names in the same order as they are in the tuple.
            # For instance a row could look like: ("bob", 34)
            # and its `keys` method could return: ["name", "age"]
            pk_ind = row.keys().index(pk_col)
            if acc and row[pk_ind] != prev_pk_val:
                counter_extract_instances.labels(
                    resource_id=analysis.resource_id, resource_type=analysis.definition_id
                ).inc()
                yield acc
                acc = defaultdict(list)
            for key, value in zip(row.keys(), row):
                acc[key].append(value)
            prev_pk_val = row[pk_ind]

        if not acc:
            raise EmptyResult(
                "The sql query returned nothing. Maybe the primary key values "
                "you provided are not present in the database or the mapping "
                "is erroneous."
            )

        counter_extract_instances.labels(
            resource_id=analysis.resource_id, resource_type=analysis.definition_id
        ).inc()
        yield acc

    def batch_size(self, analysis) -> int:
        logger.info(
            f"Start computing batch size for resource {analysis.definition_id}",
            extra={"resource_id": analysis.resource_id},
        )

        builder = QueryBuilder(
            session=self.session, metadata=self.metadata, analysis=analysis, pk_values=None
        )
        query = builder.build_batch_size_query()

        return self.session.execute(query).scalar()
