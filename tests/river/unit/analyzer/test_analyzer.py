from uuid import uuid4

from river.common.analyzer import Analyzer
from river.common.analyzer.attribute import Attribute
from river.common.analyzer.condition import Condition
from river.common.analyzer.input_group import InputGroup
from river.common.analyzer.sql_column import SqlColumn
from river.common.analyzer.sql_filter import SqlFilter
from river.common.analyzer.sql_join import SqlJoin


def test_cache_analysis_redis(patient_mapping):
    batch_id, resource_id = (uuid4(), uuid4())
    analyzer = Analyzer()

    res = analyzer.cache_analysis(batch_id, resource_id, patient_mapping)

    assert res.definition_id == "Patient"
    assert res.primary_key_column.table == "patients"
    assert res.primary_key_column.column == "row_id"

    assert analyzer.analyses[f"{batch_id}:{resource_id}"].definition_id == "Patient"
    assert analyzer.analyses[f"{batch_id}:{resource_id}"].primary_key_column.table == "patients"
    assert analyzer.analyses[f"{batch_id}:{resource_id}"].primary_key_column.column == "row_id"

    cached_res = analyzer.load_analysis(batch_id, resource_id)

    assert cached_res is not None
    assert cached_res == res


def test_get_primary_key():
    analyzer = Analyzer()

    # With owner
    resource_mapping = {
        "primaryKeyOwner": {"name": "owner"},
        "primaryKeyTable": "table",
        "primaryKeyColumn": "col",
    }
    primary_key = analyzer.get_primary_key(resource_mapping)

    assert primary_key == SqlColumn("owner", "table", "col")

    # With missing field
    resource_mapping = {
        "primaryKeyTable": "",
        "primaryKeyColumn": "col",
        "primaryKeyOwner": {"name": "owner"},
        "definitionId": "fhirtype",
    }
    assert analyzer.get_primary_key(resource_mapping) is None


def test_analyze_mapping(patient_mapping):
    analyzer = Analyzer()

    analysis = analyzer.analyze_mapping(patient_mapping)

    assert len(analysis.attributes) == 18

    assert analyzer.get_analysis_columns(analysis) == {
        SqlColumn("mimiciii", "patients", "row_id"),
        SqlColumn("mimiciii", "patients", "subject_id"),
        SqlColumn("mimiciii", "patients", "dob"),
        SqlColumn("mimiciii", "patients", "dod"),
        SqlColumn("mimiciii", "patients", "expire_flag"),
        SqlColumn("mimiciii", "patients", "gender"),
        SqlColumn(
            "mimiciii",
            "admissions",
            "admittime",
            joins=[
                SqlJoin(
                    SqlColumn("mimiciii", "patients", "subject_id"), SqlColumn("mimiciii", "admissions", "subject_id")
                )
            ],
        ),
        SqlColumn(
            "mimiciii",
            "admissions",
            "marital_status",
            joins=[
                SqlJoin(
                    SqlColumn("mimiciii", "patients", "subject_id"), SqlColumn("mimiciii", "admissions", "subject_id")
                )
            ],
        ),
        SqlColumn(
            "mimiciii",
            "admissions",
            "language",
            joins=[
                SqlJoin(
                    SqlColumn("mimiciii", "patients", "subject_id"), SqlColumn("mimiciii", "admissions", "subject_id")
                )
            ],
        ),
    }
    assert analysis.filters == [
        SqlFilter(
            SqlColumn(
                "mimiciii",
                "admissions",
                "adm_date",
                joins=[
                    SqlJoin(
                        SqlColumn("mimiciii", "patients", "subject_id"),
                        SqlColumn("mimiciii", "admissions", "subject_id"),
                    )
                ],
            ),
            ">=",
            "2012",
        ),
    ]
    assert analyzer.get_analysis_joins(analysis) == {
        SqlJoin(SqlColumn("mimiciii", "patients", "subject_id"), SqlColumn("mimiciii", "admissions", "subject_id")),
    }
    assert analysis.reference_paths == [["generalPractitioner"], ["link", "other"]]


def test_analyze_attribute(dict_map_gender):
    analyzer = Analyzer()
    analyzer._cur_analysis.primary_key_column = SqlColumn("mimiciii", "patients", "subject_id")
    analyzer._cur_analysis.definition = {"type": "Patient"}

    attribute_mapping = {
        "id": "ck8ooenpu26984kp4wyiz4yc2",
        "path": "gender",
        "sliceName": None,
        "definitionId": "code",
        "resourceId": "ck8oo3on226974kp4ns32n7xs",
        "comments": [],
        "inputGroups": [
            {
                "id": "ckdom8lgq0045m29ksz6vudvc",
                "mergingScript": None,
                "attributeId": "ck8ooenpu26984kp4wyiz4yc2",
                "inputs": [
                    {
                        "id": "ck8ooenw826994kp4whpirhdo",
                        "script": None,
                        "conceptMapId": "id_cm_gender",
                        "conceptMap": dict_map_gender,
                        "staticValue": None,
                        "sqlValueId": "ck8ooenw827004kp41nv3kcmq",
                        "inputGroupId": "ckdom8lgq0045m29ksz6vudvc",
                        "sqlValue": {
                            "id": "ck8ooenw827004kp41nv3kcmq",
                            "owner": {"name": "mimiciii"},
                            "table": "patients",
                            "column": "gender",
                            "joinId": None,
                            "joins": [
                                {
                                    "id": "ckdyl65kj0195gu9k43qei6xp",
                                    "columnId": "ckdyl65kj0194gu9k6ez7yirb",
                                    "tables": [
                                        {
                                            "id": "ckdyl65kj0196gu9ku2dy0ygg",
                                            "owner": {"name": "mimiciii"},
                                            "table": "patients",
                                            "column": "subject_id",
                                            "joinId": "ckdyl65kj0195gu9k43qei6xp",
                                        },
                                        {
                                            "id": "ckdyl65kj0197gu9k1lrvx3bl",
                                            "owner": {"name": "mimiciii"},
                                            "table": "admissions",
                                            "column": "subject_id",
                                            "joinId": "ckdyl65kj0195gu9k43qei6xp",
                                        },
                                    ],
                                }
                            ],
                        },
                    }
                ],
                "conditions": [
                    {
                        "id": "ckdyl65kl0334gu9ky8x57zvb",
                        "action": "EXCLUDE",
                        "columnId": "ckdyl65kl0335gu9kup0hwhe0",
                        "relation": "EQ",
                        "value": "1",
                        "inputGroupId": "ckdyl65kl0331gu9kjada4vf4",
                        "sqlValue": {
                            "id": "ckdyl65kl0335gu9kup0hwhe0",
                            "owner": {"name": "mimiciii"},
                            "table": "admissions",
                            "column": "expire_flag",
                            "joinId": "ckdyl65kj0195gu9k43qei6xq",
                            "joins": [
                                {
                                    "id": "ckdyl65kj0195gu9k43qei6xp",
                                    "columnId": "ckdyl65kj0194gu9k6ez7yirb",
                                    "tables": [
                                        {
                                            "id": "ckdyl65kj0196gu9ku2dy0ygg",
                                            "owner": {"name": "mimiciii"},
                                            "table": "patients",
                                            "column": "subject_id",
                                            "joinId": "ckdyl65kj0195gu9k43qei6xp",
                                        },
                                        {
                                            "id": "ckdyl65kj0197gu9k1lrvx3bl",
                                            "owner": {"name": "mimiciii"},
                                            "table": "join_table",
                                            "column": "subject_id",
                                            "joinId": "ckdyl65kj0195gu9k43qei6xp",
                                        },
                                    ],
                                },
                                {
                                    "id": "ckdyl65kj0195gu9k43qei6xp",
                                    "columnId": "ckdyl65kj0194gu9k6ez7yirb",
                                    "tables": [
                                        {
                                            "id": "ckdyl65kj0196gu9ku2dy0ygg",
                                            "owner": {"name": "mimiciii"},
                                            "table": "join_table",
                                            "column": "adm_id",
                                            "joinId": "ckdyl65kj0195gu9k43qei6xp",
                                        },
                                        {
                                            "id": "ckdyl65kj0197gu9k1lrvx3bl",
                                            "owner": {"name": "mimiciii"},
                                            "table": "admissions",
                                            "column": "adm_id",
                                            "joinId": "ckdyl65kj0195gu9k43qei6xp",
                                        },
                                    ],
                                },
                            ],
                        },
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
