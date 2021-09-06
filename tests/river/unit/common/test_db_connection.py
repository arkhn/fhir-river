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

    # With wrong model
    credentials["model"] = "model"
    with raises(ValueError, match="db_config specifies the wrong database model."):
        DBConnection.build_db_url(credentials)

    # With oracle DB
    credentials["model"] = "ORACLE"
    db_string = DBConnection.build_db_url(credentials)
    assert db_string == "oracle+cx_oracle://login:password@localhost:port/database"

    # With a service_name
    credentials["database"] = "service:service_name"
    db_string = DBConnection.build_db_url(credentials)
    assert db_string == "oracle+cx_oracle://login:password@localhost:port/?service_name=service_name"

    # With a bad prefix
    credentials["database"] = "invalid:name"
    with raises(NotImplementedError, match="db_config: bad connection type prefix in database attribute"):
        DBConnection.build_db_url(credentials)
