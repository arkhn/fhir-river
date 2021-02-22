from os import getenv

from common.database_connection.db_connection import MSSQL, ORACLE, ORACLE11, POSTGRES

DATABASES = {
    MSSQL: {
        "host": getenv("TEST_MSSQL_HOST"),
        "port": int(getenv("TEST_MSSQL_PORT")),
        "database": getenv("TEST_MSSQL_DB"),
        "login": getenv("TEST_MSSQL_LOGIN"),
        "password": getenv("TEST_MSSQL_PASSWORD"),
        "owner": "dbo",
    },
    ORACLE11: {
        "host": getenv("TEST_ORACLE_11_HOST"),
        "port": int(getenv("TEST_ORACLE_11_PORT", 1521)),
        "database": getenv("TEST_ORACLE_11_DB"),
        "login": getenv("TEST_ORACLE_11_LOGIN"),
        "password": getenv("TEST_ORACLE_11_PASSWORD"),
        "owner": "SYSTEM",
    },
    ORACLE: {
        "host": getenv("TEST_ORACLE_HOST"),
        "port": int(getenv("TEST_ORACLE_PORT", 1531)),
        "database": getenv("TEST_ORACLE_DB"),
        "login": getenv("TEST_ORACLE_LOGIN"),
        "password": getenv("TEST_ORACLE_PASSWORD"),
        "owner": "SYSTEM",
    },
    POSTGRES: {
        "host": getenv("TEST_POSTGRES_HOST"),
        "port": int(getenv("TEST_POSTGRES_PORT", 5432)),
        "database": getenv("TEST_POSTGRES_DB"),
        "login": getenv("TEST_POSTGRES_LOGIN", "test"),
        "password": getenv("TEST_POSTGRES_PASSWORD", "test"),
        "owner": "public",
    },
}
