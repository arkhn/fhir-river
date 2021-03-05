import enum
import logging

from sqlalchemy import create_engine as _create_engine
from sqlalchemy.engine.url import URL

logger = logging.getLogger(__name__)


class URLBuilder:
    dialect = None
    driver = None
    query_params = None

    @property
    def drivername(self):
        return f"{self.dialect}+{self.driver}" if self.driver else self.dialect

    def build(self, **kwargs):
        return URL(drivername=self.drivername, query=self.query_params, **kwargs)


class SQLiteURLBuilder(URLBuilder):
    dialect = "sqlite"

    def build(self, **kwargs):
        return URL(drivername=self.drivername, database=kwargs.get("database", None))


class MSSQLURLBuilder(URLBuilder):
    dialect = "mssql"
    driver = "pyodbc"
    query_params = {"driver": "ODBC+Driver+17+for+SQL+Server", "MARS_Connection": "Yes"}


class OracleURLBuilder(URLBuilder):
    dialect = "oracle"
    driver = "cx_oracle"


class PostgreSQLURLBuilder(URLBuilder):
    dialect = "postgres"
    driver = "psycopg2"


class Dialect(enum.Enum):
    MSSQL = "MSSQL"
    ORACLE = "ORACLE"
    POSTGRES = "POSTGRES"
    SQLLITE = "SQLLITE"


BUILDERS = {
    Dialect.MSSQL.value: MSSQLURLBuilder(),
    Dialect.ORACLE.value: OracleURLBuilder(),
    Dialect.POSTGRES.value: PostgreSQLURLBuilder(),
    Dialect.SQLLITE.value: SQLiteURLBuilder(),
}


def create_engine(model: str, **kwargs):
    return _create_engine(
        BUILDERS[model].build(
            username=kwargs["login"],
            password=kwargs["password"],
            host=kwargs["host"],
            port=kwargs["port"],
            database=kwargs["database"],
        ),
        # Setting pool_pre_ping to True avoids random connection closing
        pool_pre_ping=True,
    )
