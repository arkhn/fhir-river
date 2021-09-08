import pytest

from sqlalchemy import create_engine

from ..conftest import get_sql_url, load_table
from ..settings import DATABASES


@pytest.fixture(scope="session", autouse=True)
def setup_databases():
    for db_driver, db_config in DATABASES.items():
        sql_engine = create_engine(get_sql_url(db_driver, db_config))

        # Load (or reload) test data into db.
        load_table(sql_engine, "patients", "patients.csv")
        load_table(sql_engine, "UPPERCASE", "patients-uppercase.csv")
        load_table(sql_engine, "CaseSensitive", "patients-case-sensitive.csv")
