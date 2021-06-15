import json
from pathlib import Path

from pytest import fixture

import requests

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"
PATIENT_MAPPING_FILE = Path(__file__).resolve().parent.parent / "fixtures/patient_mapping.json"


class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data


@fixture
def mock_pyrog_response(monkeypatch):
    def mock_post(*args, headers, **kwargs):
        if headers["Authorization"] == "Bearer validToken":
            with open(PATIENT_MAPPING_FILE, "r") as fp:
                return MockResponse({"data": {"resource": json.load(fp)}}, 200)
        elif headers["Authorization"] == "Bearer forbiddenToken":
            return MockResponse({"errors": [{"statusCode": 403, "message": "forbidden"}]}, 200)
        elif headers["Authorization"] == "Bearer unauthorizedToken":
            return MockResponse({"errors": [{"statusCode": 401, "message": "unauthorized"}]}, 200)
        else:
            return MockResponse("invalid token", 400)

    monkeypatch.setattr(requests, "post", mock_post)


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
    def mock_get(*args, headers):
        if headers["Authorization"] == "Bearer validToken":
            return MockResponse(fhirConceptMap, 200)
        elif headers["Authorization"] == "Bearer forbiddenToken":
            return MockResponse("invalid token", 403)
        else:
            return MockResponse("invalid token", 401)

    monkeypatch.setattr(requests, "get", mock_get)
