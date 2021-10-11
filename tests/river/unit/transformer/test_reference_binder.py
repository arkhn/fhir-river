from uuid import UUID

import pytest

from river.transformer.errors import IncompleteIdentifierError
from river.transformer.reference_binder import ReferenceBinder


@pytest.fixture(scope="module")
def binder():
    return ReferenceBinder()


def test_identifier_to_reference(identifier, binder):
    resource_type = "Patient"

    reference = binder.identifier_to_reference(identifier, resource_type).split("/")

    assert reference[0] == resource_type
    UUID(reference[1], version=5)


@pytest.mark.parametrize(
    "invalid_identifier,expected_error",
    [
        (
            {"system": "http://terminology.arkhn.org/mimic_id/3fd9abb2-c4dc-4dc7-a2f8-888d5714aac4"},
            IncompleteIdentifierError,
        ),
        (
            {"system": "http://terminology.arkhn.org/mimic_id/3fd9abb2-c4dc-4dc7-a2f8-888d5714aac4", "value": ""},
            IncompleteIdentifierError,
        ),
        (
            {"value": "123"},
            IncompleteIdentifierError,
        ),
        (
            {"system": "", "value": "123"},
            IncompleteIdentifierError,
        ),
        (
            {"system": "invalid_system", "value": "123"},
            ValueError,
        ),
    ],
)
def test_invalid_identifier_to_reference(invalid_identifier, expected_error, binder):
    with pytest.raises(expected_error):
        binder.identifier_to_reference(invalid_identifier, "Patient")


def test_resolve_references(patient, binder):
    patient_reference_paths = [["generalPractitioner"], ["managingOrganization"], ["identifier", "assigner"]]
    resolved_patient = binder.resolve_references(patient, patient_reference_paths)

    # literal references must have been resolved
    reference = resolved_patient["generalPractitioner"][0]["reference"].split("/")

    assert reference[0] == "Practitioner"
    UUID(reference[1], version=5)

    reference = resolved_patient["generalPractitioner"][1]["reference"].split("/")

    assert reference[0] == "Practitioner"
    UUID(reference[1], version=5)

    reference = resolved_patient["managingOrganization"]["reference"].split("/")

    assert reference[0] == "Organization"
    UUID(reference[1], version=5)

    reference = resolved_patient["identifier"][0]["assigner"]["reference"].split("/")

    assert reference[0] == "Organization"
    UUID(reference[1], version=5)
