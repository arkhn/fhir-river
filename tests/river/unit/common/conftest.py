import pytest


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
def use_inmemory_fhir_api(settings):
    settings.DEFAULT_FHIR_API_CLASS = "common.adapters.fhir_api.InMemoryFhirAPI"
