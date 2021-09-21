from unittest.mock import patch

import pytest

from django.urls import reverse

from syrupy.filters import paths

pytestmark = [pytest.mark.django_db, pytest.mark.fhir_api]


@pytest.mark.export_data("mimic_mapping.json")
class TestPreview:
    @pytest.fixture
    def patient_mapping(self, api_client, export_data):
        url = reverse("sources-list")

        response = api_client.post(url + "import/", export_data, format="json")

        assert response.status_code == 201, response.data

        patient_mapping_id = next(
            r["id"] for r in response.json()["resources"] if r["label"].startswith("feat_6_join")
        )
        return patient_mapping_id

    def test_preview(self, api_client, patient_mapping, snapshot):
        url = reverse("preview")

        data = {
            "resource_id": patient_mapping,
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

    def test_preview_not_found(self, api_client, patient_mapping, snapshot):
        url = reverse("preview")

        data = {
            "resource_id": patient_mapping,
            "primary_key_values": ["123456789"],  # does not exist
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == 200, response.data
        assert len(response.data["errors"]) == 0, response.data["errors"]
        assert len(response.data["instances"]) == 0

    @patch(
        "river.services.fhir_api.validate",
        return_value={
            "resourceType": "OperationOutcome",
            "issue": [{"severity": "error", "code": "invalid", "diagnostics": "shit happened"}],
        },
    )
    def test_preview_with_validation_error(self, mock_validate, api_client, patient_mapping, snapshot):
        url = reverse("preview")

        data = {
            "resource_id": patient_mapping,
            "primary_key_values": ["10006"],
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == 200, response.data
        assert len(response.data["errors"]) == 1, response.data["errors"]
        assert len(response.data["instances"]) == 1
        operation_outcome = response.data["errors"][0]
        assert operation_outcome == snapshot()

    @patch("river.services.fhir_api.validate", side_effect=Exception("fhir-api-returned-an-internal-server-error"))
    def test_preview_with_validation_exception(self, mock_validate, api_client, patient_mapping, snapshot):
        url = reverse("preview")

        data = {
            "resource_id": patient_mapping,
            "primary_key_values": ["10006"],
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == 200, response.data
        assert len(response.data["errors"]) == 1, response.data["errors"]
        assert len(response.data["instances"]) == 1
        operation_outcome = response.data["errors"][0]
        assert operation_outcome == snapshot()
