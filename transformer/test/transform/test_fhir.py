from unittest import mock
import pandas as pd
from pytest import raises

from fhirstore import ARKHN_CODE_SYSTEMS

import transformer.src.transform.fhir as transform
from transformer.src.analyze.attribute import Attribute
from transformer.src.analyze.sql_column import SqlColumn


class mockdatetime:
    def strftime(self, _):
        return "now"


@mock.patch("transformer.src.transform.fhir.datetime", autospec=True)
def test_create_instance(mock_datetime):
    mock_datetime.now.return_value = mockdatetime()

    attr_identifier = Attribute("identifier[0].value", columns=[SqlColumn("a", "b")])
    attr_birthDate = Attribute("birthDate", columns=[SqlColumn("a", "c")])
    attr_maritalStatus = Attribute("maritalStatus.coding[0].code", columns=[SqlColumn("a", "d")])
    attr_generalPractitioner = Attribute(
        "generalPractitioner[0].type", static_inputs=["Practitioner"]
    )

    attributes = [attr_identifier, attr_birthDate, attr_maritalStatus, attr_generalPractitioner]
    path_attributes_map = {
        attr_identifier.path: attr_identifier,
        attr_birthDate.path: attr_birthDate,
        attr_maritalStatus.path: attr_maritalStatus,
        attr_generalPractitioner.path: attr_generalPractitioner,
    }


    row = {
        attr_maritalStatus.path: "D",
        attr_birthDate.path: "2000-10-10",
        attr_identifier.path: "A",
    }

    actual = transform.build_fhir_object(row, path_attributes_map)

    assert actual == {
        "id": actual["id"],
        "identifier": [{"value": "A"}],
        "birthDate": "2000-10-10",
        "maritalStatus": {"coding": [{"code": "D"}]},
        "generalPractitioner": [{"type": "Practitioner"}],
    }


@mock.patch("transformer.src.transform.fhir.datetime", autospec=True)
def test_build_metadata(mock_datetime):
    mock_datetime.now.return_value = mockdatetime()

    analysis = mock.MagicMock()
    analysis.source_id = "sourceId"
    analysis.resource_id = "resourceId"
    analysis.definition = {"kind": "resource", "derivation": "specialization", "url": "u/r/l"}

    metadata = transform.build_metadata(analysis)
    assert metadata == {
        "lastUpdated": "now",
        "tag": [
            {"system": ARKHN_CODE_SYSTEMS.source, "code": "sourceId"},
            {"system": ARKHN_CODE_SYSTEMS.resource, "code": "resourceId"},
        ],
    }

    analysis.definition = {"kind": "resource", "derivation": "constraint", "url": "u/r/l"}

    metadata = transform.build_metadata(analysis)
    assert metadata == {
        "lastUpdated": "now",
        "profile": ["u/r/l"],
        "tag": [
            {"system": ARKHN_CODE_SYSTEMS.source, "code": "sourceId"},
            {"system": ARKHN_CODE_SYSTEMS.resource, "code": "resourceId"},
        ],
    }


def test_fetch_values_from_dataframe():
    attr_identifier = Attribute("identifier[0].value", columns=[SqlColumn("a", "b")])
    attr_birthDate = Attribute("birthDate", columns=[SqlColumn("a", "c")])
    attr_maritalStatus = Attribute("maritalStatus.coding[0].code", columns=[SqlColumn("a", "d")])

    attribute = attr_birthDate

    row = {
        attr_maritalStatus.path: "D",
        attr_birthDate.path: "2000-10-10",
        attr_identifier.path: "A",
    }

    value = transform.fetch_values_from_dataframe(row, attribute)

    assert value == "2000-10-10"


def test_handle_array_attributes():
    attr1 = Attribute("attr1", columns=[SqlColumn("a", "b")])
    attr2 = Attribute("attr2", columns=[SqlColumn("a", "c")])
    row = {
        attr1.path: ("A1", "A2", "A3"),
        attr2.path: "B",
    }
    attributes_in_array = {
        "path1": attr1,
        "path2": attr2,
    }

    value = transform.handle_array_attributes(attributes_in_array, row)

    assert value == [
        {"path1": "A1", "path2": "B"},
        {"path1": "A2", "path2": "B"},
        {"path1": "A3", "path2": "B"},
    ]

    # With mismatch in lengths
    row = {
        attr1.path: ("A1", "A2", "A3"),
        attr2.path: ("B1", "B2"),
    }
    with raises(AssertionError, match="mismatch in array lengths"):
        transform.handle_array_attributes(attributes_in_array, row)


def test_clean_fhir_object():
    dirty = {
        "a": {"b": [{"c": 123}, {"c": 123}, {"c": 123}, {"c": 222}, {"c": 222}]},
        "d": [{"e": {"f": 456}}, {"e": {"f": 456}}, {"e": 456}],
    }
    clean = transform.clean_fhir_object(dirty)

    expected = {
        "a": {"b": [{"c": 123}, {"c": 222}]},
        "d": [{"e": {"f": 456}}, {"e": 456}],
    }

    assert clean == expected


def test_get_position_first_index():
    path = ["root", "identifier[0]", "value"]
    index = transform.get_position_first_index(path)
    assert index == 1

    path = ["identifier", "value"]
    index = transform.get_position_first_index(path)
    assert index is None


def test_remove_index():
    path = "root.identifier[0]"
    result = transform.remove_index(path)
    assert result == "root.identifier"


def test_get_remove_root_path():
    init_path = "identifier.0.value"
    path = transform.remove_root_path(init_path, 2)
    assert path == "value"
