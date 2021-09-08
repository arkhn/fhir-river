import pytest

from django.conf import settings

from sqlalchemy import create_engine

from ..conftest import get_sql_url, load_table


@pytest.fixture(scope="session", autouse=True)
def setup_databases():

    db_config = {
        "host": settings.DATABASES["default"]["HOST"],
        "port": settings.DATABASES["default"]["PORT"],
        "database": settings.DATABASES["default"]["NAME"],
        "login": settings.DATABASES["default"]["USER"],
        "password": settings.DATABASES["default"]["PASSWORD"],
        "owner": "public",
        "model": "POSTGRES",
    }

    sql_engine = create_engine(get_sql_url("POSTGRES", db_config))

    # Load (or reload) test data into db.
    load_table(sql_engine, "patients", "patients.csv")
    load_table(sql_engine, "UPPERCASE", "patients-uppercase.csv")
    load_table(sql_engine, "CaseSensitive", "patients-case-sensitive.csv")
