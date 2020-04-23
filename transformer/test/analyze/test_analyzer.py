import pytest
from unittest import mock

from transformer.src.analyze import Analyzer

from transformer.src.analyze.attribute import Attribute
from transformer.src.analyze.merging_script import MergingScript
from transformer.src.analyze.sql_column import SqlColumn
from transformer.src.analyze.sql_join import SqlJoin

from .conftest import mock_api_get_maps


def test_get_primary_key():
    analyzer = Analyzer()

    # With owner
    resource_mapping = {
        "primaryKeyOwner": "owner",
        "primaryKeyTable": "table",
        "primaryKeyColumn": "col",
    }
    primary_key = analyzer.get_primary_key(resource_mapping)

    assert primary_key == SqlColumn("table", "col", "owner")

    # Without owner
    resource_mapping = {
        "primaryKeyOwner": "",
        "primaryKeyTable": "table",
        "primaryKeyColumn": "col",
    }
    primary_key = analyzer.get_primary_key(resource_mapping)

    assert primary_key == SqlColumn("table", "col")

    # Raising error
    resource_mapping = {
        "primaryKeyOwner": "",
        "primaryKeyTable": "",
        "primaryKeyColumn": "col",
        "definitionId": "fhirtype",
    }
    with pytest.raises(
        ValueError, match="You need to provide a primary key table and column in the mapping"
    ):
        analyzer.get_primary_key(resource_mapping)


@mock.patch("transformer.src.analyze.concept_map.requests.get", mock_api_get_maps)
def test_analyze_mapping(patient_mapping):
    analyzer = Analyzer()

    analysis = analyzer.analyze_mapping(patient_mapping)

    assert analysis.attributes == [
        Attribute(
            "identifier[0].value",
            columns=[SqlColumn("patients", "row_id")],
            static_inputs=[],
            merging_script=None,
        ),
        Attribute(
            "deceasedBoolean",
            columns=[SqlColumn("patients", "expire_flag")],
            static_inputs=[],
            merging_script=None,
        ),
        Attribute(
            "generalPractitioner[0].identifier.value",
            columns=[SqlColumn("icustays", "hadm_id")],
            static_inputs=[],
            merging_script=None,
        ),
        Attribute(
            "birthDate",
            columns=[SqlColumn("patients", "dob")],
            static_inputs=[],
            merging_script=None,
        ),
        Attribute(
            "deceasedDateTime",
            columns=[SqlColumn("patients", "dod")],
            static_inputs=[],
            merging_script=None,
        ),
        Attribute(
            "gender",
            columns=[SqlColumn("patients", "gender")],
            static_inputs=["unknown"],
            merging_script=MergingScript("select_first_not_empty"),
        ),
        Attribute(
            "maritalStatus.coding[0].code",
            columns=[SqlColumn("admissions", "marital_status")],
            static_inputs=[],
            merging_script=None,
        ),
        Attribute(
            "generalPractitioner[0].type",
            columns=[],
            static_inputs=["Practitioner"],
            merging_script=None,
        ),
    ]

    assert analysis.columns == {
        SqlColumn("patients", "row_id"),
        SqlColumn("patients", "gender"),
        SqlColumn("patients", "dob"),
        SqlColumn("patients", "dod"),
        SqlColumn("patients", "expire_flag"),
        SqlColumn("admissions", "marital_status"),
        SqlColumn("icustays", "hadm_id"),
    }
    assert analysis.joins == {
        SqlJoin(SqlColumn("patients", "subject_id"), SqlColumn("admissions", "subject_id")),
        SqlJoin(SqlColumn("patients", "subject_id"), SqlColumn("icustays", "subject_id")),
    }


@mock.patch("transformer.src.analyze.concept_map.requests.get", mock_api_get_maps)
def test_reference_paths(patient_mapping):
    analyzer = Analyzer()

    analysis = analyzer.analyze_mapping(patient_mapping)

    assert analysis.reference_paths == {'generalPractitioner'}
