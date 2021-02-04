from unittest import mock

from fhirstore import ARKHN_CODE_SYSTEMS

from common.analyzer.attribute import Attribute
from pytest import mark, raises
from transformer.transform import fhir


class mockdatetime:
    def strftime(self, _):
        return "now"


@mock.patch("transformer.transform.fhir.datetime", autospec=True)
def test_create_instance(mock_datetime):
    mock_datetime.now.return_value = mockdatetime()

    attr_identifier = Attribute("identifier[0].value")
    attr_birthDate = Attribute("birthDate")
    attr_maritalStatus = Attribute("maritalStatus.coding[0].code")
    attr_generalPractitioner = Attribute("generalPractitioner[0].type")

    path_attributes_map = {
        attr_identifier.path: attr_identifier,
        attr_birthDate.path: attr_birthDate,
        attr_maritalStatus.path: attr_maritalStatus,
        attr_generalPractitioner.path: attr_generalPractitioner,
    }

    row = {
        attr_maritalStatus.path: ["D"],
        attr_birthDate.path: ["2000-10-10"],
        attr_identifier.path: ["A"],
        attr_generalPractitioner.path: ["Practitioner"],
    }

    actual = fhir.build_fhir_object(row, path_attributes_map)

    assert actual == {
        "id": actual["id"],
        "identifier": [{"value": "A"}],
        "birthDate": "2000-10-10",
        "maritalStatus": {"coding": [{"code": "D"}]},
        "generalPractitioner": [{"type": "Practitioner"}],
    }


@mark.parametrize("path", ["birthDate", ""])
def test_non_list_from_list(path):
    attr_birthDate = Attribute("birthDate")

    path_attributes_map = {path: attr_birthDate}

    row = {attr_birthDate.path: ["2000-10-10", "2000-10-11"]}

    with raises(ValueError, match="can't build non-list attribute from list"):
        fhir.build_fhir_object(row, path_attributes_map)


@mock.patch("transformer.transform.fhir.datetime", autospec=True)
def test_build_nested_arrays(mock_datetime):
    mock_datetime.now.return_value = mockdatetime()

    attr_identifier = Attribute("identifier[0].value")
    attr_status = Attribute("status")
    attr_sequence = Attribute("lineItem[0].sequence")
    attr_reference = Attribute("lineItem[0].reference")
    attr_price_component_f = Attribute("lineItem[0].priceComponent[0].factor")
    attr_price_component_t = Attribute("lineItem[0].priceComponent[0].type")

    # Only nested
    path_attributes_map = {
        attr_identifier.path: attr_identifier,
        attr_status.path: attr_status,
        attr_price_component_f.path: attr_price_component_f,
        attr_price_component_t.path: attr_price_component_t,
    }

    row = {
        attr_identifier.path: ["123"],
        attr_status.path: ["active"],
        attr_price_component_f.path: ["F1", "F2"],
        attr_price_component_t.path: ["T1", "T2"],
    }

    actual = fhir.build_fhir_object(row, path_attributes_map)

    assert actual == {
        "id": actual["id"],
        "identifier": [{"value": "123"}],
        "status": "active",
        "lineItem": [{"priceComponent": [{"factor": "F1", "type": "T1"}, {"factor": "F2", "type": "T2"}]}],
    }

    # Nested with primary value in outside array
    path_attributes_map = {
        attr_identifier.path: attr_identifier,
        attr_status.path: attr_status,
        attr_sequence.path: attr_sequence,
        attr_price_component_f.path: attr_price_component_f,
        attr_price_component_t.path: attr_price_component_t,
    }

    row = {
        attr_identifier.path: ["123"],
        attr_status.path: ["active"],
        attr_sequence.path: ["seq"],
        attr_price_component_f.path: ["F1", "F2"],
        attr_price_component_t.path: ["T1", "T2"],
    }

    actual = fhir.build_fhir_object(row, path_attributes_map)

    assert actual == {
        "id": actual["id"],
        "identifier": [{"value": "123"}],
        "status": "active",
        "lineItem": [
            {"sequence": "seq", "priceComponent": [{"factor": "F1", "type": "T1"}, {"factor": "F2", "type": "T2"}]}
        ],
    }

    # Nested with joined value in outside array
    row = {
        attr_identifier.path: ["123"],
        attr_status.path: ["active"],
        attr_sequence.path: ["seq1", "seq2"],
        attr_price_component_f.path: ["F1", "F2"],
        attr_price_component_t.path: ["T1", "T2"],
    }

    actual = fhir.build_fhir_object(row, path_attributes_map)

    assert actual == {
        "id": actual["id"],
        "identifier": [{"value": "123"}],
        "status": "active",
        "lineItem": [
            {"sequence": "seq1", "priceComponent": [{"factor": "F1", "type": "T1"}]},
            {"sequence": "seq2", "priceComponent": [{"factor": "F2", "type": "T2"}]},
        ],
    }

    # Nested with both primary and joined value in outside array
    path_attributes_map = {
        attr_identifier.path: attr_identifier,
        attr_status.path: attr_status,
        attr_reference.path: attr_reference,
        attr_sequence.path: attr_sequence,
        attr_price_component_f.path: attr_price_component_f,
        attr_price_component_t.path: attr_price_component_t,
    }

    row = {
        attr_identifier.path: ["123"],
        attr_status.path: ["active"],
        attr_reference.path: ["ref"],
        attr_sequence.path: ["seq1", "seq2"],
        attr_price_component_f.path: ["F1", "F2"],
        attr_price_component_t.path: ["T1", "T2"],
    }

    actual = fhir.build_fhir_object(row, path_attributes_map)

    assert actual == {
        "id": actual["id"],
        "identifier": [{"value": "123"}],
        "status": "active",
        "lineItem": [
            {"reference": "ref", "sequence": "seq1", "priceComponent": [{"factor": "F1", "type": "T1"}]},
            {"reference": "ref", "sequence": "seq2", "priceComponent": [{"factor": "F2", "type": "T2"}]},
        ],
    }


@mock.patch("transformer.transform.fhir.datetime", autospec=True)
def test_build_metadata(mock_datetime):
    mock_datetime.now.return_value = mockdatetime()

    analysis = mock.MagicMock()
    analysis.source_id = "sourceId"
    analysis.resource_id = "resourceId"
    analysis.definition = {
        "kind": "resource",
        "derivation": "specialization",
        "url": "u/r/l",
    }

    metadata = fhir.build_metadata(analysis)
    assert metadata == {
        "lastUpdated": "now",
        "tag": [
            {"system": ARKHN_CODE_SYSTEMS.source, "code": "sourceId"},
            {"system": ARKHN_CODE_SYSTEMS.resource, "code": "resourceId"},
        ],
    }

    analysis.definition = {
        "kind": "resource",
        "derivation": "constraint",
        "url": "u/r/l",
    }

    metadata = fhir.build_metadata(analysis)
    assert metadata == {
        "lastUpdated": "now",
        "profile": ["u/r/l"],
        "tag": [
            {"system": ARKHN_CODE_SYSTEMS.source, "code": "sourceId"},
            {"system": ARKHN_CODE_SYSTEMS.resource, "code": "resourceId"},
        ],
    }


def test_handle_array_attributes():
    attr1 = Attribute("attr1")
    attr2 = Attribute("attr2")
    row = {
        attr1.path: ["A1", "A2", "A3"],
        attr2.path: ["B"],
    }
    attributes_in_array = {
        "path1": attr1,
        "path2": attr2,
    }

    value = fhir.handle_array_attributes(attributes_in_array, row)

    assert value == [
        {"path1": "A1", "path2": "B"},
        {"path1": "A2", "path2": "B"},
        {"path1": "A3", "path2": "B"},
    ]

    # With mismatch in lengths
    row = {
        attr1.path: ["A1", "A2", "A3"],
        attr2.path: ["B1", "B2"],
    }
    with raises(ValueError, match="mismatch in array lengths"):
        fhir.handle_array_attributes(attributes_in_array, row)


def test_array_of_literals():
    attr_0 = Attribute("name[0].given[0]")
    attr_1 = Attribute("name[0].given[1]")
    attr_2 = Attribute("other_attr")

    path_attributes_map = {
        attr_0.path: attr_0,
        attr_1.path: attr_1,
        attr_2.path: attr_2,
    }

    row = {
        attr_0.path: ["Bob"],
        attr_1.path: ["Dylan"],
        attr_2.path: ["Ross"],
    }

    fhir_object = fhir.build_fhir_object(row, path_attributes_map)

    assert fhir_object == {"name": [{"given": ["Bob", "Dylan"]}], "other_attr": "Ross"}


def test_get_position_first_index():
    path = ["root", "identifier[0]", "value"]
    index = fhir.get_position_first_index(path)
    assert index == 1

    path = ["identifier", "value"]
    index = fhir.get_position_first_index(path)
    assert index is None


def test_remove_index():
    path = "root.identifier[0]"
    result = fhir.remove_index(path)
    assert result == "root.identifier"


def test_get_remove_root_path():
    init_path = "identifier.0.value"
    path = fhir.remove_root_path(init_path, 2)
    assert path == "value"
