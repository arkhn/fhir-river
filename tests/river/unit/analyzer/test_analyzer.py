from uuid import uuid4

from river.common.analyzer import Analyzer
from river.common.analyzer.attribute import Attribute
from river.common.analyzer.condition import Condition
from river.common.analyzer.input_group import InputGroup
from river.common.analyzer.sql_column import SqlColumn
from river.common.analyzer.sql_filter import SqlFilter
from river.common.analyzer.sql_join import SqlJoin


def test_cache_analysis_redis(mimic_mapping):
    batch_id = uuid4()
    resource_id = "patient-resource-id"
    analyzer = Analyzer()

    res = analyzer.cache_analysis(batch_id, resource_id, mimic_mapping)

    assert res.definition_id == "Patient"
    assert res.primary_key_column.table == "patients"
    assert res.primary_key_column.column == "subject_id"

    assert analyzer.analyses[f"{batch_id}:{resource_id}"].definition_id == "Patient"
    assert analyzer.analyses[f"{batch_id}:{resource_id}"].primary_key_column.table == "patients"
    assert analyzer.analyses[f"{batch_id}:{resource_id}"].primary_key_column.column == "subject_id"

    cached_res = analyzer.load_analysis(batch_id, resource_id)

    assert cached_res == res


def test_get_primary_key():
    analyzer = Analyzer()

    resource_mapping = {
        "primary_key_owner": "owner_id",
        "primary_key_table": "table",
        "primary_key_column": "col",
    }
    analyzer._owners_data = {"owner_id": "owner"}

    assert analyzer.get_primary_key(resource_mapping) == SqlColumn("owner", "table", "col")


def test_get_primary_key_missing_field():
    analyzer = Analyzer()

    resource_mapping = {
        "primary_key_owner": "owner_id",
        "primary_key_table": "",
        "primary_key_column": "col",
    }
    analyzer._owners_data = {"owner_id": "owner"}

    assert analyzer.get_primary_key(resource_mapping) is None


def test_analyze_mapping(mimic_mapping):
    analyzer = Analyzer()
    resource_id = "join-resource-id"

    analysis = analyzer.analyze(resource_id, mimic_mapping)

    assert len(analysis.attributes) == 2
    assert analyzer.get_analysis_columns(analysis) == {
        SqlColumn("public", "patients", "row_id"),
        SqlColumn(
            "public",
            "admissions",
            "admission_type",
            joins=[
                SqlJoin(
                    SqlColumn("public", "patients", "subject_id"),
                    SqlColumn("public", "admissions", "subject_id"),
                )
            ],
        ),
    }
    assert analysis.filters == [
        SqlFilter(
            SqlColumn(
                "public",
                "admissions",
                "admission_type",
                joins=[
                    SqlJoin(
                        SqlColumn("public", "patients", "subject_id"),
                        SqlColumn("public", "admissions", "subject_id"),
                    )
                ],
            ),
            "=",
            "EMERGENCY",
        ),
    ]
    assert analysis.reference_paths == [["generalPractitioner"], ["link", "other"]]


def test_analyze_attribute(dict_map_gender):
    analyzer = Analyzer()
    analyzer._cur_analysis.primary_key_column = SqlColumn("mimiciii", "patients", "subject_id")
    analyzer._cur_analysis.definition_id = "Patient"
    analyzer._columns_data = {
        "ck8ooenw827004kp41nv3kcmq": {
            "owner": "mimiciii",
            "table": "patients",
            "column": "gender",
            "joins": [{"columns": ["ckdyl65kj0196gu9ku2dy0ygg", "ckdyl65kj0197gu9k1lrvx3bl"]}],
        },
        "ckdyl65kj0196gu9ku2dy0ygg": {
            "owner": "mimiciii",
            "table": "patients",
            "column": "subject_id",
            "joins": [],
        },
        "ckdyl65kj0197gu9k1lrvx3bl": {
            "owner": "mimiciii",
            "table": "admissions",
            "column": "subject_id",
            "joins": [],
        },
        "ckdyl65kl0335gu9kup0hwhe0": {
            "owner": "mimiciii",
            "table": "admissions",
            "column": "expire_flag",
            "joins": [
                {"columns": ["ckdyl65kj0196gu9ku2dy0ygb", "ckdyl65kj0197gu9k1lrvx3bb"]},
                {"columns": ["ckdyl65kj0196gu9ku2dy0yga", "ckdyl65kj0197gu9k1lrvx3ba"]},
            ],
        },
        "ckdyl65kj0196gu9ku2dy0ygb": {
            "owner": "mimiciii",
            "table": "patients",
            "column": "subject_id",
            "joins": [],
        },
        "ckdyl65kj0197gu9k1lrvx3bb": {
            "owner": "mimiciii",
            "table": "join_table",
            "column": "subject_id",
            "joins": [],
        },
        "ckdyl65kj0196gu9ku2dy0yga": {
            "owner": "mimiciii",
            "table": "join_table",
            "column": "adm_id",
            "joins": [],
        },
        "ckdyl65kj0197gu9k1lrvx3ba": {
            "owner": "mimiciii",
            "table": "admissions",
            "column": "adm_id",
            "joins": [],
        },
    }
    attribute_mapping = {
        "id": "ck8ooenpu26984kp4wyiz4yc2",
        "path": "gender",
        "definition_id": "code",
        "resource_id": "ck8oo3on226974kp4ns32n7xs",
        "comments": [],
        "input_groups": [
            {
                "id": "ckdom8lgq0045m29ksz6vudvc",
                "merging_script": None,
                "inputs": [
                    {
                        "script": None,
                        "concept_map_id": "id_cm_gender",
                        "concept_map": dict_map_gender,
                        "static_value": None,
                        "column": "ck8ooenw827004kp41nv3kcmq",
                    }
                ],
                "conditions": [
                    {
                        "action": "EXCLUDE",
                        "relation": "EQ",
                        "value": "1",
                        "column": "ckdyl65kl0335gu9kup0hwhe0",
                    }
                ],
            }
        ],
    }

    actual = analyzer.analyze_attribute(attribute_mapping)

    expected = Attribute("gender")

    group = InputGroup(
        id_="ckdom8lgq0045m29ksz6vudvc",
        attribute=expected,
        conditions=[
            Condition(
                "EXCLUDE",
                SqlColumn(
                    "mimiciii",
                    "admissions",
                    "expire_flag",
                    joins=[
                        SqlJoin(
                            SqlColumn("mimiciii", "patients", "subject_id"),
                            SqlColumn("mimiciii", "join_table", "subject_id"),
                        ),
                        SqlJoin(
                            SqlColumn("mimiciii", "join_table", "adm_id"),
                            SqlColumn("mimiciii", "admissions", "adm_id"),
                        ),
                    ],
                ),
                "EQ",
                "1",
            )
        ],
        columns=[
            SqlColumn(
                "mimiciii",
                "patients",
                "gender",
                joins=[
                    SqlJoin(
                        SqlColumn("mimiciii", "patients", "subject_id"),
                        SqlColumn("mimiciii", "admissions", "subject_id"),
                    )
                ],
            )
        ],
        static_inputs=[],
        merging_script=None,
    )
    expected.add_input_group(group)

    assert actual == expected
