from pytest import raises

from river.common.database_connection.db_connection import DBConnection


def test_build_db_url():
    # With postgres DB
    credentials = {
        "model": "POSTGRES",
        "login": "login",
        "password": "password",
        "host": "localhost",
        "port": "port",
        "database": "database",
    }
    db_string = DBConnection.build_db_url(credentials)
    assert db_string == "postgresql://login:password@localhost:port/database"

    # With oracle DB
    credentials["model"] = "ORACLE"
    db_string = DBConnection.build_db_url(credentials)
    assert db_string == "oracle+cx_oracle://login:password@localhost:port/database"

    # With wrong model
    credentials["model"] = "model"
    with raises(ValueError, match="db_config specifies the wrong database model."):
        DBConnection.build_db_url(credentials)
