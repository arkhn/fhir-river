from pathlib import Path

from pytest import raises
from rest_framework.exceptions import NotAuthenticated, PermissionDenied

from river.common.mapping import fetch_concept_maps

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


def test_fetch_concept_map(mock_fhir_api_response):
    actual = fetch_concept_maps.fetch_concept_map("id", "validToken")
    expected = {
        "F": "female",
        "M": "male",
    }
    assert actual == expected


def test_fetch_concept_map_invalid(mock_fhir_api_response):
    with raises(NotAuthenticated):
        fetch_concept_maps.fetch_concept_map("id", "invalidToken")


def test_fetch_concept_map_forbidden(mock_fhir_api_response):
    with raises(PermissionDenied):
        fetch_concept_maps.fetch_concept_map("id", "forbiddenToken")


def test_dereference_concept_map(mock_fhir_api_response):
    mapping = {"attributes": [{"inputGroups": [{"inputs": [{"conceptMapId": "cm_gender"}]}]}]}

    fetch_concept_maps.dereference_concept_map(mapping, "validToken")

    assert mapping["attributes"][0]["inputGroups"][0]["inputs"][0]["conceptMap"] == {"F": "female", "M": "male"}
