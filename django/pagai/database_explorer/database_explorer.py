from collections import defaultdict
from contextlib import contextmanager
from typing import Callable, Dict, Optional

from pagai.errors import OperationOutcome
from sqlalchemy import Column, MetaData, Table, and_, create_engine, text
from sqlalchemy.exc import InvalidRequestError, NoSuchTableError
from sqlalchemy.orm import sessionmaker


def handle_between_filter(col, value):
    values = value.split(",")
    if len(values) != 2:
        raise ValueError("BETWEEN filter expects 2 values separated by a comma.")
    min_val = values[0].strip()
    max_val = values[1].strip()
    return and_(col.__ge__(min_val), col.__le__(max_val))


SQL_RELATIONS_TO_METHOD: Dict[str, Callable[[Column, str], Callable]] = {
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
ORACLE11 = "ORACLE11"
ORACLE = "ORACLE"
POSTGRES = "POSTGRES"
DB_DRIVERS = {
    POSTGRES: "postgresql",
    ORACLE11: "oracle+cx_oracle",
    ORACLE: "oracle+cx_oracle",
    MSSQL: "mssql+pyodbc",
}
URL_SUFFIXES = {
    POSTGRES: "",
    ORACLE11: "",
    ORACLE: "",
    # the param MARS_Connection=Yes solves the following issue:
    # https://github.com/catherinedevlin/ipython-sql/issues/54
    MSSQL: "?driver=ODBC+Driver+17+for+SQL+Server&MARS_Connection=Yes",
}


def get_sql_url(db_model: str, sql_config: dict) -> str:
    return (
        f"{DB_DRIVERS[db_model]}://{sql_config['login']}:{sql_config['password']}"
        f"@{sql_config['host']}:{sql_config['port']}"
        f"/{sql_config['database']}{URL_SUFFIXES[db_model]}"
    )


def table_exists(sql_engine, table_name):
    try:
        # Don't use Sqlalchemy Inspector as it uses reflection and
        # it takes a very long time on Oracle.
        metadata = MetaData(bind=sql_engine)
        return True, Table(table_name, metadata, autoload=True)
    except NoSuchTableError:
        return False, None


@contextmanager
def session_scope(explorer):
    """Provide a scope for sqlalchemy sessions."""
    session = sessionmaker(explorer._sql_engine)()
    try:
        yield session
    finally:
        session.close()


class DatabaseExplorer:
    def __init__(self, db_config: Optional[dict] = None):
        self._db_model = db_config.get("model")
        if self._db_model not in DB_DRIVERS:
            raise OperationOutcome(f"Database type {self._db_model} is unknown")

        self._sql_engine = create_engine(get_sql_url(self._db_model, db_config))
        self._metadata = MetaData(bind=self._sql_engine)

        self.db_schema = {}

    def check_connection_exists(self):
        if not self._sql_engine:
            raise OperationOutcome("DatabaseExplorer was not provided with any credentials.")

    def get_sql_alchemy_table(self, owner: str, table: str):
        return Table(table.strip(), self._metadata, schema=owner, autoload=True)

    def get_sql_alchemy_column(self, column: str, sqlalchemy_table: Table):
        """
        Return column names of a table
        """
        try:
            return sqlalchemy_table.c[column]
        except KeyError:
            # If column is not in table.c it may be because the column names
            # are case insensitive. If so, the schema can be in upper case
            # (what oracle considers as case insensitive) but the keys
            # in table.c are in lower case (what sqlalchemy considers
            # as case insensitive).
            return sqlalchemy_table.c[column.lower()]

    def get_table_rows(self, session, owner: str, table_name: str, limit=100, filters=[]):
        """
        Return content of a table with a limit
        """
        columns_names = self.get_owner_schema(owner)[table_name]

        table = self.get_sql_alchemy_table(owner, table_name)
        columns = [self.get_sql_alchemy_column(col, table) for col in columns_names]
        select = session.query(*columns)

        # Add filtering if any
        for filter_ in filters:
            table = self.get_sql_alchemy_table(filter_["sqlColumn"]["owner"]["name"], filter_["sqlColumn"]["table"])
            col = self.get_sql_alchemy_column(filter_["sqlColumn"]["column"], table)
            filter_clause = SQL_RELATIONS_TO_METHOD[filter_["relation"]](col, filter_["value"])
            select = select.filter(filter_clause)

            # Apply joins
            # TODO use fhir-river's analyzer?
            join_tables = {}
            for join in filter_["sqlColumn"]["joins"]:
                # Get tables
                left_table_owner = join["tables"][0]["owner"]["name"]
                left_table_name = join["tables"][0]["table"]
                left_column_name = join["tables"][0]["column"]
                right_table_owner = join["tables"][1]["owner"]["name"]
                right_table_name = join["tables"][1]["table"]
                right_column_name = join["tables"][1]["column"]

                left_table = join_tables.get(
                    left_table_name, self.get_sql_alchemy_table(left_table_owner, left_table_name)
                )
                right_table = join_tables.get(
                    right_table_name,
                    self.get_sql_alchemy_table(right_table_owner, right_table_name),
                )
                join_tables[left_table_name] = left_table
                join_tables[right_table_name] = right_table

                right_column = self.get_sql_alchemy_column(left_column_name, right_table)
                left_column = self.get_sql_alchemy_column(right_column_name, left_table)

                # Add join
                select = select.join(right_table, right_column == left_column, isouter=True)

        # Return as JSON serializable object
        return {"fields": columns_names, "rows": [list(row) for row in select.limit(limit).all()]}

    def explore(self, owner: str, table_name: str, limit: int, filters=[]):
        """
        Returns the first rows of a table alongside the column names.
        """
        self.check_connection_exists()

        with session_scope(self) as session:
            try:
                return self.get_table_rows(
                    session=session,
                    owner=owner,
                    table_name=table_name,
                    limit=limit,
                    filters=filters,
                )
            except InvalidRequestError as e:
                if "requested table(s) not available" in str(e):
                    raise OperationOutcome(f"Table {table_name} does not exist in database")
                else:
                    raise OperationOutcome(e)
            except Exception as e:
                raise OperationOutcome(e)

    def get_owners(self):
        """
        Returns all owners of a database.
        """
        self.check_connection_exists()

        if self._db_model in [ORACLE, ORACLE11]:
            sql_query = text("select username as owners from all_users")
        else:  # POSTGRES AND MSSQL
            sql_query = text("select schema_name as owners from information_schema.schemata;")

        with self._sql_engine.connect() as connection:
            result = connection.execute(sql_query).fetchall()
        return [r["owners"] for r in result]

    def get_owner_schema(self, owner: str):
        """
        Returns the database schema for one owner of a database,
        as required by Pyrog.
        """
        if self.db_schema.get(owner):
            return self.db_schema[owner]

        self.check_connection_exists()
        schema = defaultdict(list)

        if self._db_model in [ORACLE, ORACLE11]:
            sql_query = text(f"select table_name, column_name from all_tab_columns where owner='{owner}'")
        else:  # POSTGRES AND MSSQL
            sql_query = text(
                f"select table_name, column_name from information_schema.columns " f"where table_schema='{owner}';"
            )

        with self._sql_engine.connect() as connection:
            result = connection.execute(sql_query).fetchall()
            for row in result:
                schema[row["table_name"]].append(row["column_name"])

        self.db_schema[owner] = schema
        return schema
