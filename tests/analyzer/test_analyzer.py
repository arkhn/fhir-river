import json
import pytest
from unittest import mock

from common.analyzer import Analyzer
from common.analyzer.attribute import Attribute
from common.analyzer.input_group import InputGroup
from common.analyzer.sql_column import SqlColumn
from common.analyzer.sql_filter import SqlFilter
from common.analyzer.sql_join import SqlJoin


def test_load_cached_analysis_redis(patient_mapping):
    fake_redis = "fake_redis"
    analyzer = Analyzer(redis_client=fake_redis)
    analyzer.redis = mock.MagicMock()
    analyzer.redis.get.return_value = json.dumps(patient_mapping)

    res = analyzer.load_cached_analysis("abc", "123")

    assert res.definition_id == "Patient"
    assert res.primary_key_column.table == "patients"
    assert res.primary_key_column.column == "row_id"

    assert analyzer.analyses["abc:123"].definition_id == "Patient"
    assert analyzer.analyses["abc:123"].primary_key_column.table == "patients"
    assert analyzer.analyses["abc:123"].primary_key_column.column == "row_id"


def test_load_cached_analysis_memory():
    fake_redis = "fake_redis"
    analyzer = Analyzer(redis_client=fake_redis)
    analyzer.analyze = mock.MagicMock()

    dummy_mapping = {"dummy": "mapping"}
    analyzer.analyses["abc:123"] = dummy_mapping

    res = analyzer.load_cached_analysis("abc", "123")

    assert res == dummy_mapping
    analyzer.analyze.assert_not_called()


def test_get_primary_key():
    analyzer = Analyzer(None)

    # With owner
    resource_mapping = {
        "primaryKeyTable": "table",
        "primaryKeyColumn": "col",
        "source": {"credential": {"owner": "owner"}},
    }
    primary_key = analyzer.get_primary_key(resource_mapping)

    assert primary_key == SqlColumn("table", "col", "owner")

    # Without owner
    resource_mapping = {
        "primaryKeyTable": "table",
        "primaryKeyColumn": "col",
        "source": {"credential": {"owner": ""}},
    }
    primary_key = analyzer.get_primary_key(resource_mapping)

    assert primary_key == SqlColumn("table", "col")

    # Raising error
    resource_mapping = {
        "primaryKeyTable": "",
        "primaryKeyColumn": "col",
        "source": {"credential": {"owner": ""}},
        "definitionId": "fhirtype",
    }
    with pytest.raises(
        ValueError, match="You need to provide a primary key table and column in the mapping"
    ):
        analyzer.get_primary_key(resource_mapping)


def test_analyze_mapping(patient_mapping):
    analyzer = Analyzer()

    analysis = analyzer.analyze_mapping(patient_mapping)

    assert len(analysis.attributes) == 18

    assert analyzer.get_analysis_columns(analysis) == {
        SqlColumn("patients", "row_id"),
        SqlColumn("patients", "subject_id"),
        SqlColumn("patients", "dob"),
        SqlColumn("patients", "dod"),
        SqlColumn("patients", "expire_flag"),
        SqlColumn("patients", "gender"),
        SqlColumn(
            "admissions",
            "admittime",
            joins=[
                SqlJoin(SqlColumn("patients", "subject_id"), SqlColumn("admissions", "subject_id"))
            ],
        ),
        SqlColumn(
            "admissions",
            "marital_status",
            joins=[
                SqlJoin(SqlColumn("patients", "subject_id"), SqlColumn("admissions", "subject_id"))
            ],
        ),
        SqlColumn(
            "admissions",
            "language",
            joins=[
                SqlJoin(SqlColumn("patients", "subject_id"), SqlColumn("admissions", "subject_id"))
            ],
        ),
    }
    assert analysis.filters == [
        SqlFilter(SqlColumn("patients", "row_id"), ">=", "0"),
    ]
    assert analyzer.get_analysis_joins(analysis) == {
        SqlJoin(SqlColumn("patients", "subject_id"), SqlColumn("admissions", "subject_id")),
    }
    assert analysis.reference_paths == {"generalPractitioner"}


def test_analyze_attribute(patient_mapping, dict_map_gender):
    analyzer = Analyzer()
    analyzer._cur_analysis.primary_key_column = SqlColumn("patients", "subject_id")

    attribute_mapping = {
        "id": "ck8ooenpu26984kp4wyiz4yc2",
        "path": "gender",
        "sliceName": None,
        "definitionId": "code",
        "resourceId": "ck8oo3on226974kp4ns32n7xs",
        "updatedAt": "2020-08-10T14:33:13.135Z",
        "createdAt": "2020-08-10T14:33:13.130Z",
        "comments": [],
        "inputGroups": [
            {
                "id": "ckdom8lgq0045m29ksz6vudvc",
                "mergingScript": None,
                "attributeId": "ck8ooenpu26984kp4wyiz4yc2",
                "updatedAt": "2020-08-10T14:33:13.135Z",
                "createdAt": "2020-08-10T14:33:13.130Z",
                "inputs": [
                    {
                        "id": "ck8ooenw826994kp4whpirhdo",
                        "script": None,
                        "conceptMapId": "id_cm_gender",
                        "conceptMap": dict_map_gender,
                        "staticValue": None,
                        "sqlValueId": "ck8ooenw827004kp41nv3kcmq",
                        "inputGroupId": "ckdom8lgq0045m29ksz6vudvc",
                        "updatedAt": "2020-08-10T14:33:13.135Z",
                        "createdAt": "2020-08-10T14:33:13.130Z",
                        "sqlValue": {
                            "id": "ck8ooenw827004kp41nv3kcmq",
                            "table": "patients",
                            "column": "gender",
                            "joinId": None,
                            "updatedAt": "2020-08-10T14:33:13.135Z",
                            "createdAt": "2020-08-10T14:33:13.130Z",
                            "joins": [],
                        },
                    }
                ],
                "conditions": [],
            }
        ],
    }

    actual = analyzer.analyze_attribute(attribute_mapping)

    expected = Attribute("gender")

    group = InputGroup(
        id_="ckdom8lgq0045m29ksz6vudvc",
        attribute=expected,
        conditions=[],
        columns=[SqlColumn("patients", "gender")],
        static_inputs=[],
        merging_script=None,
    )
    expected.add_input_group(group)

    assert actual == expected
