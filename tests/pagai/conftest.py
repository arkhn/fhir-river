import inspect
import os.path as osp

import pytest
from factory import Factory
from pytest_factoryboy import register

import pandas as pd
from river.common.database_connection.db_connection import DB_DRIVERS, URL_SUFFIXES
from sqlalchemy import MetaData, Table, create_engine
from sqlalchemy.exc import NoSuchTableError

from . import factories
from .settings import DATABASES

register(factories.SourceFactory)
register(factories.SourceUserFactory)
register(factories.ResourceFactory)
register(factories.CredentialFactory)
register(factories.OwnerFactory)
register(factories.UserFactory)


def get_test_data_path(filename: str) -> str:
    this_directory = osp.dirname(osp.realpath(__file__))
    return osp.join(this_directory, "data", filename)


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


@pytest.fixture(scope="session", params=list(DATABASES.keys()))
def db_config(request):
    db_driver = request.param
    db_config = DATABASES[db_driver]

    sql_engine = create_engine(get_sql_url(db_driver, db_config))

    # Load (or reload) test data into db.
    load_table(sql_engine, "patients", "patients.csv")
    load_table(sql_engine, "UPPERCASE", "patients-uppercase.csv")
    load_table(sql_engine, "CaseSensitive", "patients-case-sensitive.csv")

    db_config["model"] = db_driver
    return db_config


def load_table(sql_engine, table_name, data_file):
    data = pd.read_csv(get_test_data_path(data_file), sep=",", encoding="utf-8", parse_dates=["date"])
    # Use custom check if table exists instead of pandas feature
    # df.to_sql(if_exists='replace') because it uses reflection on Oracle and
    # it's very slow.
    exists, table = table_exists(sql_engine, table_name)
    if exists:
        table.drop(sql_engine)
        print("dropped existing test table:", table_name)

    data.to_sql(name=table_name, con=sql_engine)


def get_factories():
    return [
        factory
        for (_, factory) in inspect.getmembers(factories, lambda o: inspect.isclass(o) and issubclass(o, Factory))
    ]


@pytest.fixture
def reset_factories_sequences():
    """Reset all sequences for predictable values."""
    for factory in get_factories():
        factory.reset_sequence()
