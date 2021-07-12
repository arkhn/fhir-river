import logging
from contextlib import contextmanager

from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

MSSQL = "MSSQL"
ORACLE = "ORACLE"
ORACLE11 = "ORACLE11"
POSTGRES = "POSTGRES"
DB_DRIVERS = {POSTGRES: "postgresql", ORACLE: "oracle+cx_oracle", ORACLE11: "oracle+cx_oracle", MSSQL: "mssql+pyodbc"}
URL_SUFFIXES = {
    POSTGRES: "",
    ORACLE: "",
    ORACLE11: "",
    # the param MARS_Connection=Yes solves the following issue:
    # https://github.com/catherinedevlin/ipython-sql/issues/54
    MSSQL: "?driver=ODBC+Driver+17+for+SQL+Server&MARS_Connection=Yes",
}


class DBConnection:
    def __init__(self, db_config):
        db_string = self.build_db_url(db_config)

        # Setting pool_pre_ping to True avoids random connection closing
        self._db_model = db_config["model"]
        self.engine = create_engine(db_string, pool_pre_ping=True)
        self.metadata = MetaData(bind=self.engine)

    @staticmethod
    def build_db_url(db_config) -> str:
        """build the database connection url

        In the case of a Oracle database, the database attribute may be suffixed
        with "service:" if a service name is provided
        https://docs.sqlalchemy.org/en/14/dialects/oracle.html#dsn-vs-hostname-connections

        :param db_config: contains the credentials and the info
        needed for the connection
        :return: result string
        """
        model = db_config["model"]
        login = db_config["login"]
        password = db_config["password"]
        host = db_config["host"]
        port = db_config["port"]
        database = db_config["database"]

        try:
            db_handler = DB_DRIVERS[model]
            url_suffix = URL_SUFFIXES[model]
        except KeyError:
            raise ValueError(
                "db_config specifies the wrong database model. "
                "Only 'POSTGRES', 'ORACLE' and 'MSSQL' are currently supported."
            )
        try:
            [connection_type, target_name] = database.split(":", 1)
            if connection_type == "service":
                return f"{db_handler}://{login}:{password}@{host}:{port}/?service_name={target_name}&{url_suffix}"
        except ValueError:
            return f"{db_handler}://{login}:{password}@{host}:{port}/{database}{url_suffix}"

    @contextmanager
    def session_scope(self):
        """Provide a scope for sqlalchemy sessions."""
        session = sessionmaker(self.engine)()
        try:
            yield session
        finally:
            session.close()
