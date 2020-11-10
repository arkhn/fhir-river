from collections import defaultdict
from prometheus_client import Counter as PromCounter
from sqlalchemy import (
    and_,
    Column as AlchemyColumn,
    create_engine,
    distinct,
    func,
    MetaData,
    Table,
)
from sqlalchemy.orm import (
    aliased,
    sessionmaker,
    Query,
)
from typing import Callable, Dict, List, Any, Optional

from analyzer.src.analyze.analysis import Analysis
from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.sql_column import SqlColumn
from extractor.src.config.service_logger import logger
from extractor.src.errors import EmptyResult, ImproperMappingError

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
    def extract(self, analysis, pk_values: Optional[List[Any]] = None):
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
        query = self.sqlalchemy_query(analysis, pk_values)

        return self.run_sql_query(query)

    @Timer("time_extractor_build_query", "time to build sql query")
    def sqlalchemy_query(self, analysis: Analysis, pk_values) -> Query:
        """ Builds an sql alchemy query which will be run in run_sql_query.
        """
        logger.info(
            f"Start building query for resource {analysis.definition_id}",
            extra={"resource_id": analysis.resource_id},
        )

        sqlalchemy_pk_table = self.get_table(analysis.primary_key_column)
        query = self.session.query(
            self.get_column(analysis.primary_key_column, sqlalchemy_pk_table)
        )

        # Add attributes to query
        for attribute in analysis.attributes:
            query = self.add_attribute_to_query(
                query, attribute, analysis.primary_key_column.table, sqlalchemy_pk_table
            )

        # Add filters to query
        query_w_filters = self.apply_filters(query, analysis, pk_values)

        logger.info(
            f"Built query for resource {analysis.definition_id}: {query_w_filters.statement}",
            extra={"resource_id": analysis.resource_id},
        )
        return query_w_filters

    def add_attribute_to_query(
        self, query: Query, attribute: Attribute, pk_table, sqlalchemy_pk_table
    ):
        for input_group in attribute.input_groups:
            for col in input_group.columns:
                sqlalchemy_table = self.get_table(col)
                sqlalchemy_col = self.get_column(col, sqlalchemy_table)
                query = query.add_columns(sqlalchemy_col)

                for join in col.joins:
                    left_table = sqlalchemy_pk_table if pk_table == join.left.table else None
                    right_table = sqlalchemy_table if col.table == join.right.table else None
                    query = query.join(
                        sqlalchemy_table,
                        self.get_column(join.right, right_table)
                        == self.get_column(join.left, left_table),
                        isouter=True,
                    )

            for condition in input_group.conditions:
                query = query.add_columns(condition.sql_column)

        return query

    def apply_filters(
        self, query: Query, analysis: Analysis, pk_values: Optional[List[Any]]
    ) -> Query:
        """ Augment the sql alchemy query with filters from the analysis.
        """
        if pk_values is not None:
            if len(pk_values) == 1:
                query = query.filter(self.get_column(analysis.primary_key_column) == pk_values[0])
            else:
                query = query.filter(self.get_column(analysis.primary_key_column).in_(pk_values))

        for sql_filter in analysis.filters:
            col = self.get_column(sql_filter.sql_column)
            filter_clause = SQL_RELATIONS_TO_METHOD[sql_filter.relation](col, sql_filter.value)
            query = query.filter(filter_clause)

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
        logger.info(f"Executing query: {query.statement}", extra={"resource_id": resource_id})
        print(f"Executing query: {query.statement}")

        return query.yield_per(CHUNK_SIZE)

    def batch_size(self, analysis) -> int:
        logger.info(
            f"Start computing batch size for resource {analysis.definition_id}",
            extra={"resource_id": analysis.resource_id},
        )
        pk_column = self.get_column(analysis.primary_key_column)
        base_query = self.session.query(func.count(distinct(pk_column)))
        query_w_filters = self.apply_filters(base_query, analysis, None)
        logger.info(
            f"Sql query to compute batch size: {query_w_filters.statement}",
            extra={"resource_id": analysis.resource_id},
        )
        res = query_w_filters.session.execute(query_w_filters)

        return res.scalar()

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
        table = Table(
            column.table, self.metadata, schema=column.owner, keep_existing=True, autoload=True,
        )
        return aliased(table)

    @staticmethod
    @Timer("time_extractor_split", "time to split dataframe")
    def split_dataframe(df: Query, analysis: Analysis):
        # Find primary key column
        logger.info(
            f"Splitting dataframe for resource {analysis.definition_id}",
            extra={"resource_id": analysis.resource_id},
        )
        # TODO I don't think it's necessarily present in the df
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
