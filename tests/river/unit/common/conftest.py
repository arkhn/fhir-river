import json
from pathlib import Path

from pytest import fixture

import requests


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
    def mock_get(*args, headers):
        if headers["Authorization"] == "Bearer validToken":
            return MockResponse(fhirConceptMap, 200)
        elif headers["Authorization"] == "Bearer forbiddenToken":
            return MockResponse("invalid token", 403)
        else:
            return MockResponse("invalid token", 401)

    monkeypatch.setattr(requests, "get", mock_get)
