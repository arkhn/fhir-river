from unittest import mock

from control.api.fetch_mapping import dereference_concept_map

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


@mock.patch("control.api.fetch_mapping.requests.get", side_effect=mocked_fhir_api_get)
def test_dereference_concept_map(_):

    mapping = {"attributes": [{"inputGroups": [{"inputs": [{"conceptMapId": "cm_gender"}]}]}]}

    dereference_concept_map(mapping, "Bearer validToken")

    assert mapping["attributes"][0]["inputGroups"][0]["inputs"][0]["conceptMap"] == {"F": "female", "M": "male"}
