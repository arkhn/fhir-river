from extractor.extract import Extractor
from pytest import raises
from sqlalchemy import Column, MetaData, Table

meta = MetaData()
tables = {
    "patients": Table("patients", meta, Column("subject_id"), Column("row_id")),
    "admissions": Table("admissions", meta, Column("subject_id"), Column("row_id"), Column("admittime")),
    "prescriptions": Table("prescriptions", meta, Column("row_id")),
}


def mock_get_column(_, sql_column):
    table = tables[sql_column.table]
    return table.c[sql_column.column]


def mock_get_table(_, sql_column):
    return tables[sql_column.table]


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
    db_string = Extractor.build_db_url(credentials)
    assert db_string == "postgresql://login:password@localhost:port/database"

    # With oracle DB
    credentials["model"] = "ORACLE"
    db_string = Extractor.build_db_url(credentials)
    assert db_string == "oracle+cx_oracle://login:password@localhost:port/database"

    # With wrong model
    credentials["model"] = "model"
    with raises(ValueError, match="credentials specifies the wrong database model."):
        Extractor.build_db_url(credentials)
