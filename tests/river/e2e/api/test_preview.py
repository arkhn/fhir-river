import pytest

from django.urls import reverse

from syrupy.filters import paths

pytestmark = pytest.mark.django_db


@pytest.mark.export_data("mimic_mapping.json")
def test_preview(api_client, export_data, snapshot):
    url = reverse("sources-list")

    response = api_client.post(url + "import/", export_data, format="json")

    assert response.status_code == 201, response.data

    url = reverse("preview")
    patient_mapping_id = next(r["id"] for r in response.json()["resources"] if r["label"] == "patient-resource-id")

    data = {
        "resource_id": patient_mapping_id,
        "primary_key_values": ["10006"],
    }
    response = api_client.post(url, data, format="json")

    assert response.status_code == 200, response.data
    assert len(response.data["errors"]) == 0, response.data["errors"]
    assert len(response.data["instances"]) == 1
    fhir_instance = response.data["instances"][0]

    # exclude the following attributes from the snapshort assertion:
    # - lastUpdated: changes at each run
    # - meta.tag.*.code: source_id or resource_id,
    # changes at each run since the mapping is re-imported
    assert fhir_instance == snapshot(exclude=paths("meta.lastUpdated", "meta.tag.0.code", "meta.tag.1.code"))
