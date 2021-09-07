from pathlib import Path

from pytest import fixture

from common.adapters.fhir_api import HapiFhirAPI


class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data


fhirConceptMap = {
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


@fixture
def mock_fhir_api_response(monkeypatch):
    def mock_get(*arg):
        return MockResponse(fhirConceptMap, 200).json_data

    monkeypatch.setattr(HapiFhirAPI, "get", mock_get)
