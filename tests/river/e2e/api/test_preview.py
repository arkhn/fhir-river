from unittest.mock import patch

import pytest

from django.urls import reverse

from syrupy.filters import paths
from tests.conftest import load_mapping
from tests.pyrog.api.conftest import DATA_DIR

pytestmark = [pytest.mark.django_db, pytest.mark.fhir_api]


@pytest.fixture(scope="module")
def patient_mapping(api_client, django_db_setup, django_db_blocker):
    # https://pytest-django.readthedocs.io/en/latest/database.html#populate-the-database-with-initial-test-data
    with django_db_blocker.unblock():
        url = reverse("sources-list")

        mimic_mapping = load_mapping(DATA_DIR / "exports" / "valid/mimic.json")
        response = api_client.post(url + "import/", mimic_mapping, format="json")

        assert response.status_code == 201, response.data

        patient_mapping_id = next(
            r["id"] for r in response.json()["resources"] if r["label"].startswith("feat_6_join")
        )
        return patient_mapping_id


def test_preview(api_client, patient_mapping, snapshot):
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


def test_preview_not_found(api_client, patient_mapping, snapshot):
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
def test_preview_with_validation_error(mock_validate, api_client, patient_mapping, snapshot):
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
