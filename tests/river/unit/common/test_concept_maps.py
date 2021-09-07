from pathlib import Path

from django.test import override_settings

from common.adapters.fhir_api import fhir_api
from river.common.mapping import concept_maps

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


@override_settings(DEFAULT_FHIR_API_CLASS="common.adapters.fhir_api.InMemoryFhirAPI")
def test_format_concept_map(concept_map):
    fhir_api.create("ConceptMap", concept_map)

    actual = concept_maps.format_concept_map("id", "validToken")
    expected = {
        "F": "female",
        "M": "male",
    }
    assert actual == expected


@override_settings(DEFAULT_FHIR_API_CLASS="common.adapters.fhir_api.InMemoryFhirAPI")
def test_dereference_concept_map(concept_map):
    fhir_api.create("ConceptMap", concept_map)

    mapping = {"attributes": [{"input_groups": [{"inputs": [{"concept_map_id": "cm_gender"}]}]}]}

    concept_maps.dereference_concept_map(mapping, "validToken")

    assert mapping["attributes"][0]["input_groups"][0]["inputs"][0]["concept_map"] == {"F": "female", "M": "male"}
