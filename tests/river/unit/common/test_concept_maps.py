from pathlib import Path

from common.adapters.fhir_api import fhir_api
from river.common.mapping import concept_maps

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


def test_format_concept_map(concept_map):
    fhir_api.create("ConceptMap", concept_map)

    actual = concept_maps.format_concept_map("cm_gender", "validToken")
    expected = {
        "F": "female",
        "M": "male",
    }
    assert actual == expected


def test_dereference_concept_map(concept_map):
    fhir_api.create("ConceptMap", concept_map)

    mapping = {"attributes": [{"input_groups": [{"inputs": [{"concept_map_id": "cm_gender"}]}]}]}

    concept_maps.dereference_concept_map(mapping, "validToken")

    assert mapping["attributes"][0]["input_groups"][0]["inputs"][0]["concept_map"] == {"F": "female", "M": "male"}
