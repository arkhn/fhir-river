import time

import pytest
from confluent_kafka.admin import AdminClient

import requests

from . import settings
from .conftest import send_batch

pytestmark = pytest.mark.e2e


def cancel_batch(batch_id):
    try:
        response = requests.delete(f"{settings.RIVER_API_URL}/batches/{batch_id}/")
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to the api service")

    assert response.status_code == 204, f"api DELETE /batches/{batch_id}/ returned an error: {response.text}"


def is_batch_canceled(batch_id):
    try:
        response = requests.get(f"{settings.RIVER_API_URL}/batches/{batch_id}/")
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to the api service")

    assert response.status_code == 200, f"api GET /batches/{batch_id}/ returned an error: {response.text}"
    batch = response.json()
    return batch["canceled_at"] is not None


def test_cancel_batch(uploaded_mapping):
    # Send Patient and Encounter batch
    batch = send_batch(uploaded_mapping)
    batch_id = batch["id"]

    cancel_batch(batch_id)
    assert is_batch_canceled(batch_id)

    # Test if the batch topics have been deleted
    # NOTE with the Python API, topics are only marked as "to delete" and the operation
    # is asynchronous. Thus, we sleep.
    time.sleep(10)
    batch_topics = [
        f"batch.{batch_id}",
        f"extract.{batch_id}",
        f"transform.{batch_id}",
        f"load.{batch_id}",
    ]
    topics = AdminClient({"bootstrap.servers": settings.KAFKA_LISTENER}).list_topics().topics
    assert not set(batch_topics) & set(topics)
