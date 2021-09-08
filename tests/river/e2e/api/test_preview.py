import pytest

from django.urls import reverse

from common.adapters.fhir_api import fhir_api

pytestmark = pytest.mark.django_db


@pytest.mark.export_data("mimic_mapping.json")
def test_preview(api_client, export_data, concept_map):
    url = reverse("sources-list")

    fhir_api.create("ConceptMap", concept_map)

    response = api_client.post(url + "import/", export_data, format="json")

    assert response.status_code == 201, response.data

    url = reverse("preview")
    patient_mapping_id = next(r["id"] for r in response.json()["resources"] if r["primary_key_table"] == "patients")

    data = {
        "resource_id": patient_mapping_id,
        "primary_key_values": ["10006"],
    }
    response = api_client.post(url, data, format="json")

    assert response.status_code == 200, response.data
    assert len(response.data["errors"]) == 0
    assert len(response.data["instances"]) == 1
    fhir_instance = response.data["instances"][0]
    assert fhir_instance == {
        "id": fhir_instance["id"],
        "resourceType": "Patient",
        "meta": {
            "lastUpdated": fhir_instance["meta"]["lastUpdated"],
            "tag": [
                {
                    "system": "http://terminology.arkhn.org/CodeSystem/source",
                    "code": fhir_instance["meta"]["tag"][0]["code"],
                },
                {
                    "system": "http://terminology.arkhn.org/CodeSystem/resource",
                    "code": fhir_instance["meta"]["tag"][1]["code"],
                },
            ],
        },
        "name": [{"given": ["Jean", "Georges"]}],
        "identifier": [
            {"system": "http://terminology.arkhn.org/b8efd322-3e38-4072-9c68-e62e15d84d04", "value": "10006"}
        ],
    }
