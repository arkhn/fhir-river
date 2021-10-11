import json
from pathlib import Path
from time import sleep

import pytest

import requests
from fhirpy import SyncFHIRClient
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_fixed

from . import settings

DATA_FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


@pytest.fixture(scope="session")
def fhir_client() -> SyncFHIRClient:
    return SyncFHIRClient(settings.FHIR_API_URL, authorization=settings.FHIR_API_AUTH_TOKEN)


@pytest.fixture(scope="session", autouse=True)
def load_concept_maps():
    with open(DATA_FIXTURES_DIR / "concept_maps.json") as concept_maps_file:
        concept_maps = json.load(concept_maps_file)
        for entry in concept_maps.get("entry", []):
            resource = entry.get("resource")
            resource_type = resource.get("resourceType")
            resource_id = resource.get("id")
            _ = requests.put(
                f"{settings.FHIR_API_URL}/{resource_type}/{resource_id}",
                json=resource,
                headers={"Authorization": settings.FHIR_API_AUTH_TOKEN},
            )


@pytest.fixture(scope="session")
def mappings():
    with open(DATA_FIXTURES_DIR / "mimic_mapping.json") as mapping_file:
        mapping = json.load(mapping_file)
        return mapping


@pytest.fixture(scope="session")
def uploaded_mapping(mappings):
    try:
        # send a batch request
        response = requests.post(f"{settings.RIVER_API_URL}/sources/import/", json=mappings)
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to the api service")

    assert response.status_code == 201, f"api POST /sources/import/ returned an error: {response.text}"

    created_mapping = response.json()
    assert (
        len([resource["id"] for resource in created_mapping["resources"]]) > 0
    ), f"no resource ids in mapping: {created_mapping}"

    yield created_mapping
    response = requests.delete(f"{settings.RIVER_API_URL}/sources/{created_mapping['id']}/", json=mappings)
    assert (
        response.status_code == 204
    ), f"api DELETE /sources/{created_mapping['id']}/ returned an error: {response.text}"


@pytest.fixture(scope="session")
def batch(uploaded_mapping):
    # Send Patient and Encounter batch
    batch = send_batch(uploaded_mapping)

    while True:
        sleep(10)
        updated_batch = retrieve_batch(batch["id"])
        if updated_batch["completed_at"] is not None:
            yield batch
            break


def send_batch(mapping) -> dict:
    resource_ids = [resource["id"] for resource in mapping["resources"]]
    try:
        # send a batch request
        response = requests.post(f"{settings.RIVER_API_URL}/batches/", json={"resources": resource_ids})
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to the api service")

    assert response.status_code == 201, f"api POST /batches returned an error: {response.text}"
    return response.json()


@retry(
    retry=retry_if_exception_type(requests.exceptions.ConnectionError), stop=stop_after_attempt(5), wait=wait_fixed(1)
)
def retrieve_batch(batch_id) -> dict:
    response = requests.get(f"{settings.RIVER_API_URL}/batches/{batch_id}/")
    assert response.status_code == 200, f"api GET /batches/{batch_id}/ returned an error: {response.text}"
    return response.json()
