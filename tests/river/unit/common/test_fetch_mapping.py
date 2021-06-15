from pathlib import Path

from pytest import raises
from rest_framework.exceptions import NotAuthenticated, PermissionDenied

from common.mapping import fetch_mapping

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


def test_fetch_resource_mapping_invalid(mock_pyrog_response, mock_fhir_api_response):
    with raises(NotAuthenticated):
        fetch_mapping.fetch_concept_map("id", "Bearer invalidToken")


def test_fetch_resource_mapping_forbidden(mock_pyrog_response, mock_fhir_api_response):
    with raises(PermissionDenied):
        fetch_mapping.fetch_concept_map("id", "Bearer forbiddenToken")


def test_fetch_concept_map(mock_fhir_api_response):
    actual = fetch_mapping.fetch_concept_map("id", "Bearer validToken")
    expected = {
        "F": "female",
        "M": "male",
    }
    assert actual == expected


def test_fetch_concept_map_invalid(mock_fhir_api_response):
    with raises(NotAuthenticated):
        fetch_mapping.fetch_concept_map("id", "Bearer invalidToken")


def test_fetch_concept_map_forbidden(mock_fhir_api_response):
    with raises(PermissionDenied):
        fetch_mapping.fetch_concept_map("id", "Bearer forbiddenToken")


def test_dereference_concept_map(mock_fhir_api_response):
    mapping = {"attributes": [{"inputGroups": [{"inputs": [{"conceptMapId": "cm_gender"}]}]}]}

    fetch_mapping.dereference_concept_map(mapping, "Bearer validToken")

    assert mapping["attributes"][0]["inputGroups"][0]["inputs"][0]["conceptMap"] == {"F": "female", "M": "male"}
