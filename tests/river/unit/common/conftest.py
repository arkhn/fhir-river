import pytest

from common.adapters.fhir_api import fhir_api


@pytest.fixture
def concept_map():
    return {
        "id": "cm_gender",
        "group": [
            {
                "element": [
                    {"code": "F", "target": [{"code": "female", "equivalence": "equal"}]},
                    {"code": "M", "target": [{"code": "male", "equivalence": "equal"}]},
                ]
            }
        ],
    }


@pytest.fixture(autouse=True)
def load_concept_map(concept_map):
    fhir_api.create("ConceptMap", concept_map)
