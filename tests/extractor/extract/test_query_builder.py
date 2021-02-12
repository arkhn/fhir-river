from unittest import mock

from common.analyzer.analysis import Analysis
from common.analyzer.attribute import Attribute
from common.analyzer.condition import Condition
from common.analyzer.input_group import InputGroup
from common.analyzer.sql_column import SqlColumn
from common.analyzer.sql_filter import SqlFilter
from common.analyzer.sql_join import SqlJoin
from extractor.extract.query_builder import QueryBuilder
from sqlalchemy import Column, MetaData, Table
from sqlalchemy.orm.query import Query

meta = MetaData()
tables = {
    "patients": Table("patients", meta, Column("subject_id"), Column("row_id"), Column("patient_id"), schema="public"),
    "admissions": Table(
        "admissions",
        meta,
        Column("subject_id"),
        Column("row_id"),
        Column("patient_id"),
        Column("admittime"),
        schema="public",
    ),
    "prescriptions": Table("prescriptions", meta, Column("row_id"), schema="public"),
    "join_table": Table("join_table", meta, Column("pat_id"), Column("adm_id"), schema="public"),
}


def mock_table(name, metadata, **kwargs):
    return tables[name]


def mock_alchemy_query(*columns):
    return Query([*columns])


def make_query_builder(analysis, pk_values=None):
    session = mock.MagicMock()
    session.query = mock_alchemy_query
    return QueryBuilder(session, None, analysis, pk_values)


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("extractor.extract.query_builder.Table", mock_table)
def test_sqlalchemy_query(mock_sha1):
    mock_sha1.return_value.hexdigest.return_value = "hash"

    analysis = Analysis()

    attribute_a = Attribute(path="path", definition_id="string")
    input_group_a = InputGroup(id_="group", attribute=attribute_a)
    attribute_a.add_input_group(input_group_a)
    input_group_a.add_column(SqlColumn("public", "patients", "subject_id"))

    attribute_b = Attribute(path="path", definition_id="string")
    input_group_b = InputGroup(id_="group", attribute=attribute_b)
    attribute_b.add_input_group(input_group_b)
    input_group_b.add_column(SqlColumn("public", "patients", "row_id"))
    condition = Condition(
        action="INCLUDE",
        sql_column=SqlColumn("public", "patients", "row_id"),
        relation="EQ",
        value="333",
    )
    input_group_b.add_condition(condition)

    attribute_c = Attribute(path="path", definition_id="string")
    input_group_c = InputGroup(id_="group", attribute=attribute_c)
    attribute_c.add_input_group(input_group_c)
    input_group_c.add_column(
        SqlColumn(
            "public",
            "admissions",
            "admittime",
            joins=[
                SqlJoin(
                    SqlColumn("public", "patients", "patient_id"),
                    SqlColumn("public", "admissions", "patient_id"),
                )
            ],
        )
    )
    condition = Condition(
        action="INCLUDE",
        sql_column=SqlColumn("public", "patients", "row_id"),
        relation="EQ",
        value="333",
    )
    input_group_c.add_condition(condition)

    analysis.primary_key_column = SqlColumn("public", "patients", "subject_id")
    analysis.add_filter(
        SqlFilter(
            SqlColumn(
                "public",
                "admissions",
                "admittime",
                joins=[
                    SqlJoin(
                        SqlColumn("public", "patients", "patient_id"),
                        SqlColumn("public", "admissions", "patient_id"),
                    )
                ],
            ),
            "LIKE",
            "2150-08-29",
        )
    )
    analysis.attributes.append(attribute_a)
    analysis.attributes.append(attribute_b)
    analysis.attributes.append(attribute_c)

    query_builder = make_query_builder(analysis)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT public.patients.subject_id AS patients_subject_id_hash, "
        "public.patients.row_id AS patients_row_id_hash, "
        "admissions_1.admittime AS admissions_admittime_hash \n"
        "FROM public.patients "
        "LEFT OUTER JOIN public.admissions AS admissions_1 "
        "ON admissions_1.patient_id = public.patients.patient_id \n"
        "WHERE admissions_1.admittime LIKE :param_1"
    )
    assert query.statement.compile().params == {"param_1": "2150-08-29"}


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("extractor.extract.query_builder.Table", mock_table)
def test_2hop_joins(mock_sha1):
    mock_sha1.return_value.hexdigest.return_value = "hash"

    analysis = Analysis()

    attribute = Attribute(path="path", definition_id="string")
    input_group = InputGroup(id_="group", attribute=attribute)
    attribute.add_input_group(input_group)
    input_group.add_column(
        SqlColumn(
            "public",
            "admissions",
            "admittime",
            joins=[
                SqlJoin(
                    SqlColumn("public", "patients", "row_id"),
                    SqlColumn("public", "join_table", "pat_id"),
                ),
                SqlJoin(
                    SqlColumn("public", "join_table", "adm_id"),
                    SqlColumn("public", "admissions", "row_id"),
                ),
            ],
        )
    )

    analysis.primary_key_column = SqlColumn("public", "patients", "subject_id")
    analysis.attributes.append(attribute)

    query_builder = make_query_builder(analysis)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT public.patients.subject_id AS patients_subject_id_hash, "
        "admissions_1.admittime AS admissions_admittime_hash \n"
        "FROM public.patients "
        "LEFT OUTER JOIN public.join_table AS join_table_1 ON join_table_1.pat_id = public.patients.row_id "
        "LEFT OUTER JOIN public.admissions AS admissions_1 ON admissions_1.row_id = join_table_1.adm_id"
    )


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("extractor.extract.query_builder.Table", mock_table)
def test_1and2hop_joins(mock_sha1):
    mock_sha1.return_value.hexdigest.return_value = "hash"

    analysis = Analysis()

    attribute = Attribute(path="path", definition_id="string")
    input_group = InputGroup(id_="group", attribute=attribute)
    attribute.add_input_group(input_group)
    input_group.add_column(
        SqlColumn(
            "public",
            "join_table",
            "adm_id",
            joins=[
                SqlJoin(
                    SqlColumn("public", "patients", "row_id"),
                    SqlColumn("public", "join_table", "pat_id"),
                ),
            ],
        )
    )
    input_group.add_column(
        SqlColumn(
            "public",
            "admissions",
            "admittime",
            joins=[
                SqlJoin(
                    SqlColumn("public", "patients", "row_id"),
                    SqlColumn("public", "join_table", "pat_id"),
                ),
                SqlJoin(
                    SqlColumn("public", "join_table", "adm_id"),
                    SqlColumn("public", "admissions", "row_id"),
                ),
            ],
        )
    )

    analysis.primary_key_column = SqlColumn("public", "patients", "subject_id")
    analysis.attributes.append(attribute)

    query_builder = make_query_builder(analysis)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT public.patients.subject_id AS patients_subject_id_hash, "
        "join_table_1.adm_id AS join_table_adm_id_hash, "
        "admissions_1.admittime AS admissions_admittime_hash \n"
        "FROM public.patients "
        "LEFT OUTER JOIN public.join_table AS join_table_1 ON join_table_1.pat_id = public.patients.row_id "
        "LEFT OUTER JOIN public.admissions AS admissions_1 ON admissions_1.row_id = join_table_1.adm_id"
    )


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("extractor.extract.query_builder.Table", mock_table)
def test_duplicated_joins(mock_sha1):
    mock_sha1.return_value.hexdigest.return_value = "hash"

    analysis = Analysis()

    attribute_a = Attribute(path="path", definition_id="string")
    input_group_a = InputGroup(id_="group", attribute=attribute_a)
    attribute_a.add_input_group(input_group_a)
    input_group_a.add_column(
        SqlColumn(
            "public",
            "admissions",
            "subject_id",
            joins=[
                SqlJoin(
                    SqlColumn("public", "patients", "subject_id"),
                    SqlColumn("public", "admissions", "subject_id"),
                ),
            ],
        )
    )

    attribute_b = Attribute(path="path", definition_id="string")
    input_group_b = InputGroup(id_="group", attribute=attribute_b)
    attribute_b.add_input_group(input_group_b)
    input_group_b.add_column(
        SqlColumn(
            "public",
            "admissions",
            "row_id",
            joins=[
                SqlJoin(
                    SqlColumn("public", "patients", "subject_id"),
                    SqlColumn("public", "admissions", "subject_id"),
                ),
            ],
        )
    )

    attribute_c = Attribute(path="path", definition_id="string")
    input_group_c = InputGroup(id_="group", attribute=attribute_c)
    attribute_c.add_input_group(input_group_c)
    input_group_c.add_column(
        SqlColumn(
            "public",
            "admissions",
            "admittime",
            None,
            joins=[
                SqlJoin(
                    SqlColumn("public", "patients", "row_id"),
                    SqlColumn("public", "admissions", "row_id"),
                ),
            ],
        )
    )

    analysis.primary_key_column = SqlColumn("public", "patients", "subject_id")
    analysis.attributes.append(attribute_a)
    analysis.attributes.append(attribute_b)
    analysis.attributes.append(attribute_c)

    query_builder = make_query_builder(analysis)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT public.patients.subject_id AS patients_subject_id_hash, "
        "admissions_1.subject_id AS admissions_subject_id_hash, "
        "admissions_1.row_id AS admissions_row_id_hash, "
        "admissions_2.admittime AS admissions_admittime_hash \n"
        "FROM public.patients LEFT OUTER JOIN public.admissions AS admissions_1 "
        "ON admissions_1.subject_id = public.patients.subject_id "
        "LEFT OUTER JOIN public.admissions AS admissions_2 ON admissions_2.row_id = public.patients.row_id"
    )


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("extractor.extract.query_builder.Table", mock_table)
def test_apply_filters(mock_sha1):
    mock_sha1.return_value.hexdigest.return_value = "hash"
    analysis = Analysis()

    analysis.primary_key_column = SqlColumn("public", "patients", "subject_id")
    analysis.add_filter(SqlFilter(SqlColumn("public", "admissions", "admittime"), "LIKE", "2150-08-29"))
    analysis.add_filter(SqlFilter(SqlColumn("public", "patients", "row_id"), "<=", "1000"))
    analysis.add_filter(SqlFilter(SqlColumn("public", "patients", "row_id"), "BETWEEN", "500,800"))

    pk_values = [123, 456]

    query_builder = make_query_builder(analysis, pk_values)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT public.patients.subject_id AS patients_subject_id_hash \n"
        "FROM public.patients, public.admissions \n"
        "WHERE public.patients.subject_id IN (:param_1, :param_2) "
        "AND public.admissions.admittime LIKE :param_3 "
        "AND public.patients.row_id <= :param_4 "
        "AND public.patients.row_id >= :param_5 AND public.patients.row_id <= :param_6"
    )
    assert query.statement.compile().params == {
        "param_1": 123,
        "param_2": 456,
        "param_3": "2150-08-29",
        "param_4": "1000",
        "param_5": "500",
        "param_6": "800",
    }


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("extractor.extract.query_builder.Table", mock_table)
def test_apply_filters_single_value(mock_sha1):
    mock_sha1.return_value.hexdigest.return_value = "hash"
    analysis = Analysis()
    analysis.primary_key_column = SqlColumn("public", "patients", "subject_id")

    primary_key = 123
    filter_values = [primary_key]

    query_builder = make_query_builder(analysis, filter_values)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT public.patients.subject_id AS patients_subject_id_hash \n"
        "FROM public.patients \n"
        "WHERE public.patients.subject_id = :param_1"
    )
    assert query.statement.compile().params == {"param_1": 123}


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("extractor.extract.query_builder.Table", mock_table)
def test_filters_with_joins(mock_sha1):
    mock_sha1.return_value.hexdigest.return_value = "hash"
    analysis = Analysis()

    analysis.primary_key_column = SqlColumn("public", "patients", "subject_id")
    analysis.add_filter(
        SqlFilter(
            SqlColumn(
                "public",
                "admissions",
                "admittime",
                joins=[
                    SqlJoin(
                        SqlColumn("public", "patients", "subject_id"),
                        SqlColumn("public", "admissions", "subject_id"),
                    )
                ],
            ),
            "LIKE",
            "2150-08-29",
        )
    )

    query_builder = make_query_builder(analysis)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT public.patients.subject_id AS patients_subject_id_hash \n"
        "FROM public.patients LEFT OUTER JOIN public.admissions AS admissions_1 "
        "ON admissions_1.subject_id = public.patients.subject_id \n"
        "WHERE admissions_1.admittime LIKE :param_1"
    )
    assert query.statement.compile().params == {"param_1": "2150-08-29"}


@mock.patch("common.analyzer.sql_column.hashlib.sha1")
@mock.patch("extractor.extract.query_builder.Table", mock_table)
def test_conditions_with_joins(mock_sha1):
    mock_sha1.return_value.hexdigest.return_value = "hash"

    analysis = Analysis()

    attribute = Attribute(path="path", definition_id="string")
    input_group = InputGroup(id_="group", attribute=attribute)
    attribute.add_input_group(input_group)
    input_group.add_column(SqlColumn("public", "patients", "row_id"))
    condition = Condition(
        action="INCLUDE",
        sql_column=SqlColumn(
            "public",
            "admissions",
            "admittime",
            joins=[
                SqlJoin(
                    SqlColumn("public", "patients", "subject_id"),
                    SqlColumn("public", "admissions", "subject_id"),
                )
            ],
        ),
        relation="EQ",
        value="2013",
    )
    input_group.add_condition(condition)

    analysis.primary_key_column = SqlColumn("public", "patients", "subject_id")
    analysis.attributes.append(attribute)

    query_builder = make_query_builder(analysis)
    query = query_builder.build_query()

    assert str(query) == (
        "SELECT public.patients.subject_id AS patients_subject_id_hash, "
        "public.patients.row_id AS patients_row_id_hash, "
        "admissions_1.admittime AS admissions_admittime_hash \n"
        "FROM public.patients LEFT OUTER JOIN public.admissions AS admissions_1 "
        "ON admissions_1.subject_id = public.patients.subject_id"
    )
