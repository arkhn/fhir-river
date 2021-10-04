import pytest

from river.common.database_connection.db_connection import DBConnection

base_credentials = {
    "model": "ORACLE",
    "login": "login",
    "password": "password",
    "host": "localhost",
    "port": "port",
    "database": "database",
}


@pytest.mark.parametrize(
    "model,expected_url",
    [
        (
            "MSSQL",
            "mssql+pyodbc://login:password@localhost:port/database?"
            "driver=ODBC+Driver+17+for+SQL+Server&MARS_Connection=Yes",
        ),
        ("ORACLE", "oracle+cx_oracle://login:password@localhost:port/database"),
        ("ORACLE11", "oracle+cx_oracle://login:password@localhost:port/database"),
        ("POSTGRES", "postgresql://login:password@localhost:port/database"),
    ],
)
def test_build_db_url(model, expected_url):
    credentials = {**base_credentials, "model": model}
    db_string = DBConnection.build_db_url(credentials)
    assert db_string == expected_url


def test_unexisting_model():
    credentials = {**base_credentials, "model": "model"}
    with pytest.raises(ValueError, match="db_config specifies the wrong database model."):
        DBConnection.build_db_url(credentials)


def test_service_name():
    credentials = {**base_credentials, "database": "service:service_name"}
    db_string = DBConnection.build_db_url(credentials)
    assert db_string == "oracle+cx_oracle://login:password@localhost:port/?service_name=service_name"


def test_bad_service_prefix():
    credentials = {**base_credentials, "database": "invalid:service_name"}
    with pytest.raises(NotImplementedError, match="db_config: bad connection type prefix in database attribute"):
        DBConnection.build_db_url(credentials)
