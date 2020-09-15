import pytest
import time
from unittest import mock

from analyzer.src.analyze.graphql import PyrogClient
from analyzer.src.analyze import Analyzer

from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.input_group import InputGroup
from analyzer.src.analyze.sql_column import SqlColumn
from analyzer.src.analyze.sql_filter import SqlFilter
from analyzer.src.analyze.sql_join import SqlJoin

from analyzer.test.conftest import mock_api_get_maps


@mock.patch("analyzer.src.analyze.graphql.PyrogClient.login")
def test_get_analysis_first_time(mock_login):
    analyzer = Analyzer(PyrogClient())

    # patch the fetch_analysis method
    def side_effect(resource):
        analyzer.analyses[resource] = None

    analyzer.fetch_analysis = mock.MagicMock()
    analyzer.fetch_analysis.side_effect = side_effect

    analyzer.get_analysis("Resource")

    analyzer.fetch_analysis.assert_called_with("Resource")


@mock.patch("analyzer.src.analyze.graphql.PyrogClient.login")
def test_get_analysis_no_refresh(mock_login):
    resource_id = "Resource"

    analyzer = Analyzer(PyrogClient())
    analyzer.analyses[resource_id] = None
    analyzer.last_updated_at[resource_id] = time.time() - 200

    analyzer.fetch_analysis = mock.MagicMock()

    analyzer.get_analysis(resource_id)

    analyzer.fetch_analysis.assert_not_called()


@mock.patch("analyzer.src.analyze.graphql.PyrogClient.login")
def test_get_analysis_refresh_old(mock_login):
    resource_id = "Resource"

    analyzer = Analyzer(PyrogClient())
    analyzer.analyses[resource_id] = None
    analyzer.last_updated_at[resource_id] = time.time() - 5000

    analyzer.fetch_analysis = mock.MagicMock()

    analyzer.get_analysis(resource_id)

    analyzer.fetch_analysis.assert_called_with(resource_id)
    analyzer.fetch_analysis.reset_mock()


@mock.patch("analyzer.src.analyze.graphql.PyrogClient.login")
def test_get_primary_key(mock_login):
    analyzer = Analyzer(PyrogClient())

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


@mock.patch("analyzer.src.analyze.concept_map.requests.get", mock_api_get_maps)
@mock.patch("analyzer.src.analyze.graphql.PyrogClient.login")
def test_analyze_mapping(mock_login, patient_mapping):
    analyzer = Analyzer(PyrogClient())

    analysis = analyzer.analyze_mapping(patient_mapping)

    assert len(analysis.attributes) == 17

    assert analysis.columns == {
        SqlColumn("patients", "row_id"),
        SqlColumn("patients", "subject_id"),
        SqlColumn("patients", "dob"),
        SqlColumn("patients", "dod"),
        SqlColumn("patients", "expire_flag"),
        SqlColumn("patients", "gender"),
        SqlColumn("admissions", "admittime"),
        SqlColumn("admissions", "marital_status"),
        SqlColumn("admissions", "language"),
    }
    assert analysis.filters == [
        SqlFilter(SqlColumn("patients", "row_id"), ">=", 0),
    ]
    assert analysis.joins == {
        SqlJoin(SqlColumn("patients", "subject_id"), SqlColumn("admissions", "subject_id")),
    }
    assert analysis.reference_paths == {"generalPractitioner"}


@mock.patch("analyzer.src.analyze.concept_map.requests.get", mock_api_get_maps)
@mock.patch("analyzer.src.analyze.graphql.PyrogClient.login")
def test_analyze_attribute(mock_login, patient_mapping):
    analyzer = Analyzer(PyrogClient())
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
