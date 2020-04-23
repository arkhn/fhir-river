from pytest import raises
from unittest import mock

from sqlalchemy import Table, Column, MetaData

from extractor.src.extract.extractor import Extractor
from extractor.src.analyze.sql_column import SqlColumn
from extractor.src.analyze.sql_join import SqlJoin

# from test.unit.conftest import mock_config

meta = MetaData()
tables = {
    "patients": Table("patients", meta, Column("subject_id"), Column("row_id")),
    "admissions": Table(
        "admissions", meta, Column("subject_id"), Column("row_id"), Column("admittime")
    ),
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


def test_sqlalchemy_query():
    # TODO
    pass


@mock.patch("extractor.src.extract.extractor.Extractor.get_column", mock_get_column)
@mock.patch("extractor.src.extract.extractor.Extractor.get_table", mock_get_table)
def test_apply_joins():
    extractor = Extractor()
    joins = [
        SqlJoin(SqlColumn("patients", "subject_id"), SqlColumn("admissions", "subject_id")),
        SqlJoin(SqlColumn("admissions", "row_id"), SqlColumn("prescriptions", "row_id")),
    ]

    base_query = mock.MagicMock()

    extractor.apply_joins(base_query, joins)

    foreign_tables = [tables["admissions"], tables["prescriptions"]]
    binary_expressions = [
        mock_get_column("", SqlColumn("patients", "subject_id"))
        == mock_get_column("", SqlColumn("admissions", "subject_id")),
        mock_get_column("", SqlColumn("admissions", "row_id"))
        == mock_get_column("", SqlColumn("prescriptions", "row_id")),
    ]
    for call, foreign_table, binary_expression in zip(
        base_query.join.call_args_list, foreign_tables, binary_expressions
    ):
        args, kwargs = call
        assert args[0] == foreign_table
        assert args[1].compare(binary_expression)
        assert kwargs == {"isouter": True}


@mock.patch("extractor.src.extract.extractor.Extractor.get_column", mock_get_column)
@mock.patch("extractor.src.extract.extractor.Extractor.get_table", mock_get_table)
def test_apply_filters():
    extractor = Extractor()
    resource_mapping = {
        "filters": [
            {
                "relation": "LIKE",
                "value": "'2150-08-29'",
                "sqlColumn": {"owner": None, "table": "admissions", "column": "admittime"},
            },
            {
                "relation": "<=",
                "value": "1000",
                "sqlColumn": {"owner": None, "table": "patients", "column": "row_id"},
            },
        ]
    }
    pk_column = SqlColumn("patients", "subject_id")
    pk_values = [123, 456]

    base_query = mock.MagicMock()

    extractor.apply_filters(base_query, resource_mapping, pk_column, pk_values)

    binary_expressions = [
        extractor.get_column(SqlColumn("patients", "subject_id")).in_(pk_values),
        extractor.get_column(SqlColumn("admissions", "admittime")).like("'2150-08-29'"),
        extractor.get_column(SqlColumn("patients", "row_id")) <= "1000",
    ]

    for call, binary_expression in zip(base_query.filter.call_args_list, binary_expressions):
        args, kwargs = call
        assert args[0].compare(binary_expression)
