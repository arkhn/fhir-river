from sqlalchemy import (
    and_,
    Column,
    MetaData,
    Table,
)
from sqlalchemy.orm.query import Query
from unittest import mock

from analyzer.src.analyze.analysis import Analysis
from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.input_group import InputGroup
from analyzer.src.analyze.sql_column import SqlColumn
from analyzer.src.analyze.sql_filter import SqlFilter
from analyzer.src.analyze.sql_join import SqlJoin

from extractor.src.extract.extractor import Extractor
from extractor.src.extract.query_builder import QueryBuilder

meta = MetaData()
tables = {
    "patients": Table("patients", meta, Column("subject_id"), Column("row_id")),
    "admissions": Table(
        "admissions", meta, Column("subject_id"), Column("row_id"), Column("admittime")
    ),
    "prescriptions": Table("prescriptions", meta, Column("row_id")),
    "join_table": Table("join_table", meta, Column("pat_id"), Column("adm_id")),
}


def mock_table(name, metadata, **kwargs):
    return tables[name]


def mock_alchemy_query(*columns):
    return Query([*columns])


def make_query_builder(analysis, pk_values=None):
    extractor = Extractor()
    extractor.session = mock.MagicMock()
    extractor.session.query = mock_alchemy_query
    return QueryBuilder(extractor.session, extractor.metadata, analysis, pk_values)


@mock.patch("extractor.src.extract.query_builder.Table", mock_table)
def test_sqlalchemy_query():
    analysis = Analysis()

    attributeA = Attribute(path="path", definition_id="string")
    input_groupA = InputGroup(id_="group", attribute=attributeA)
    attributeA.add_input_group(input_groupA)
    input_groupA.add_column(SqlColumn("patients", "subject_id", None))

    attributeB = Attribute(path="path", definition_id="string")
    input_groupB = InputGroup(id_="group", attribute=attributeB)
    attributeB.add_input_group(input_groupB)
    input_groupB.add_column(SqlColumn("patients", "row_id", None))

    attributeC = Attribute(path="path", definition_id="string")
    input_groupC = InputGroup(id_="group", attribute=attributeC)
    attributeC.add_input_group(input_groupC)
    input_groupC.add_column(
        SqlColumn(
            "admissions",
            "admittime",
            None,
            joins=[
                SqlJoin(
                    SqlColumn("patients", "row_id", None), SqlColumn("admissions", "row_id", None),
                )
            ],
        )
    )

    analysis.primary_key_column = SqlColumn("patients", "subject_id")
    analysis.add_filter(SqlFilter(SqlColumn("admissions", "admittime"), "LIKE", "'2150-08-29'"))
    analysis.attributes.append(attributeA)
    analysis.attributes.append(attributeB)
    analysis.attributes.append(attributeC)

    query_builder = make_query_builder(analysis)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT patients.subject_id AS patients_subject_id, "
        "patients.subject_id AS patients_subject_id, patients.row_id AS patients_row_id, "
        "admissions_1.admittime AS admissions_admittime \n"
        "FROM admissions AS admissions_2, patients "
        "LEFT OUTER JOIN admissions AS admissions_1 ON admissions_1.row_id = patients.row_id \n"
        "WHERE admissions_2.admittime LIKE :param_1"
    )


@mock.patch("extractor.src.extract.query_builder.Table", mock_table)
def test_2hop_joins():
    analysis = Analysis()

    attributeC = Attribute(path="path", definition_id="string")
    input_groupC = InputGroup(id_="group", attribute=attributeC)
    attributeC.add_input_group(input_groupC)
    input_groupC.add_column(
        SqlColumn(
            "admissions",
            "admittime",
            None,
            joins=[
                SqlJoin(
                    SqlColumn("patients", "row_id", None), SqlColumn("join_table", "pat_id", None),
                ),
                SqlJoin(
                    SqlColumn("join_table", "adm_id", None),
                    SqlColumn("admissions", "row_id", None),
                ),
            ],
        )
    )

    analysis.primary_key_column = SqlColumn("patients", "subject_id")
    analysis.attributes.append(attributeC)

    query_builder = make_query_builder(analysis)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT patients.subject_id AS patients_subject_id, "
        "admissions_1.admittime AS admissions_admittime \n"
        "FROM patients "
        "LEFT OUTER JOIN admissions AS admissions_1 ON join_table_1.pat_id = patients.row_id "
        "LEFT OUTER JOIN admissions AS admissions_1 ON admissions_1.row_id = join_table_2.adm_id"
    )


@mock.patch("extractor.src.extract.query_builder.Table", mock_table)
def test_apply_filters():
    analysis = Analysis()

    analysis.primary_key_column = SqlColumn("patients", "subject_id")
    analysis.add_filter(SqlFilter(SqlColumn("admissions", "admittime"), "LIKE", "'2150-08-29'"))
    analysis.add_filter(SqlFilter(SqlColumn("patients", "row_id"), "<=", "1000"))
    analysis.add_filter(SqlFilter(SqlColumn("patients", "row_id"), "BETWEEN", "500,800"))

    pk_values = [123, 456]

    query_builder = make_query_builder(analysis, pk_values)

    base_query = mock.MagicMock()
    base_query.filter.return_value = base_query

    query_builder.apply_filters(base_query)

    binary_expressions = [
        query_builder.get_column(SqlColumn("patients", "subject_id")).in_(pk_values),
        query_builder.get_column(SqlColumn("admissions", "admittime")).like("'2150-08-29'"),
        query_builder.get_column(SqlColumn("patients", "row_id")) <= "1000",
        and_(
            query_builder.get_column(SqlColumn("patients", "row_id")) >= "500",
            query_builder.get_column(SqlColumn("patients", "row_id")) <= "800",
        ),
    ]

    for call, binary_expression in zip(base_query.filter.call_args_list, binary_expressions):
        args, _ = call
        assert str(args[0]) == str(binary_expression)


@mock.patch("extractor.src.extract.query_builder.Table", mock_table)
def test_apply_filters_single_value():
    analysis = Analysis()
    analysis.primary_key_column = SqlColumn("patients", "subject_id")

    primary_key = 123
    filter_values = [primary_key]

    query_builder = make_query_builder(analysis, filter_values)

    base_query = mock.MagicMock()
    base_query.filter.return_value = base_query

    query_builder.apply_filters(base_query)

    binary_expressions = [
        query_builder.get_column(SqlColumn("patients", "subject_id")).__eq__(primary_key),
    ]

    for call, binary_expression in zip(base_query.filter.call_args_list, binary_expressions):
        args, _ = call
        assert str(args[0]) == str(binary_expression)
