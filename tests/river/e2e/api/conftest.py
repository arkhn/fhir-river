import pytest


@pytest.fixture
def concept_map():
    return {
        "id": "8d45157a-12c5-4da2-8b80-0c5607fa37d7",
        "group": [
            {
                "element": [
                    {"code": "F", "target": [{"code": "female", "equivalence": "equal"}]},
                    {"code": "M", "target": [{"code": "male", "equivalence": "equal"}]},
                ]
            }
        ],
    }
