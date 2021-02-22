from uuid import UUID

import pytest

from transformer.reference_binder import ReferenceBinder


def test_identifier_to_reference(identifier):
    binder = ReferenceBinder()
    resource_type = "Patient"
    reference = binder.identifier_to_reference(identifier, resource_type).split("/")
    assert reference[0] == resource_type
    UUID(reference[1], version=5)


def test_invalid_identifier_to_reference(identifier):
    binder = ReferenceBinder()
    resource_type = "Patient"
    identifier_without_value = {"system": identifier["system"]}
    with pytest.raises(KeyError):
        binder.identifier_to_reference(identifier_without_value, resource_type)
    identifier_without_system = {"value": identifier["value"]}
    with pytest.raises(KeyError):
        binder.identifier_to_reference(identifier_without_system, resource_type)
    identifier_with_invalid_system = {"system": "invalid_system", "value": identifier["value"]}
    with pytest.raises(ValueError):
        binder.identifier_to_reference(identifier_with_invalid_system, resource_type)


def test_resolve_references(patient):
    binder = ReferenceBinder()
    patient_reference_paths = [["generalPractitioner"], ["managingOrganization"], ["identifier", "assigner"]]
    resolved_patient = binder.resolve_references(patient, patient_reference_paths)
    # literal references must have been resolved
    assert resolved_patient["generalPractitioner"][0]["reference"].startswith("Practitioner/")
    UUID(resolved_patient["generalPractitioner"][0]["reference"][-36:], version=5)
    assert resolved_patient["generalPractitioner"][1]["reference"].startswith("Practitioner/")
    UUID(resolved_patient["generalPractitioner"][1]["reference"][-36:], version=5)
    assert resolved_patient["managingOrganization"]["reference"].startswith("Organization/")
    UUID(resolved_patient["managingOrganization"]["reference"][-36:], version=5)
    assert resolved_patient["identifier"][0]["assigner"]["reference"].startswith("Organization/")
    UUID(resolved_patient["identifier"][0]["assigner"]["reference"][-36:], version=5)
