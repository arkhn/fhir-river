import json
from pathlib import Path
from unittest import mock

from control.api import fetch_mapping

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"

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


class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data


def mocked_fhir_api_get(url, headers):
    if headers["Authorization"] == "Bearer validToken":
        return MockResponse({"data": fhirConceptMap}, 200)
    elif headers["Authorization"] == "Bearer forbiddenToken":
        return MockResponse("invalid token", 403)
    else:
        return MockResponse("invalid token", 401)


def mocked_pyrog_api_get(url, headers):
    if headers["Authorization"] == "Bearer validToken":
        with open(FIXTURES_DIR / "patient_mapping.json", "r") as fp:
            return MockResponse({"data": {"resource": json.load(fp)}}, 200)
    elif headers["Authorization"] == "Bearer forbiddenToken":
        return MockResponse({"errors": [{"statusCode": 403, "message": "forbidden"}]}, 200)
    elif headers["Authorization"] == "Bearer unauthorizedToken":
        return MockResponse({"errors": [{"statusCode": 401, "message": "unauthorized"}]}, 200)
    else:
        return MockResponse("invalid token", 400)


@mock.patch("control.api.fetch_mapping.requests.get", side_effect=mocked_fhir_api_get)
def test_fetch_concept_map(_):
    actual = fetch_mapping.fetch_concept_map("id", "Bearer validToken")
    expected = {
        "F": "female",
        "M": "male",
    }
    assert actual == expected


@mock.patch("control.api.fetch_mapping.requests.get", side_effect=mocked_fhir_api_get)
def test_dereference_concept_map(_):

    mapping = {"attributes": [{"inputGroups": [{"inputs": [{"conceptMapId": "cm_gender"}]}]}]}

    fetch_mapping.dereference_concept_map(mapping, "Bearer validToken")

    assert mapping["attributes"][0]["inputGroups"][0]["inputs"][0]["conceptMap"] == {"F": "female", "M": "male"}
