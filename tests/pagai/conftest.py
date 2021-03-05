import os.path as osp

import pytest

import pandas as pd
from common.database_connection import db_connection as db
from sqlalchemy import MetaData, Table, create_engine
from sqlalchemy.exc import NoSuchTableError

from .settings import DATABASES


def get_test_data_path(filename: str) -> str:
    this_directory = osp.dirname(osp.realpath(__file__))
    return osp.join(this_directory, "data", filename)


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
    database = request.param
    db_config = DATABASES[database]

    sql_engine = create_engine(
        db.BUILDERS[db_config["model"]],
        username=db_config["login"],
        password=db_config["password"],
        host=db_config["host"],
        port=db_config["port"],
        database=db_config["database"],
    )

    # Load (or reload) test data into db.
    load_table(sql_engine, "patients", "patients.csv")
    load_table(sql_engine, "UPPERCASE", "patients-uppercase.csv")
    load_table(sql_engine, "CaseSensitive", "patients-case-sensitive.csv")

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
