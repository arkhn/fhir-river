import json
from typing import List
from unittest import mock

import pytest

from django.urls import reverse

from river import models

pytestmark = [pytest.mark.django_db, pytest.mark.redis, pytest.mark.kafka]


def mock_fetch_mapping(_, resource_id):
    return {"resource_id": resource_id, "key": "mapping"}


@mock.patch("river.api.views.APIPyrogClient.fetch_mapping", mock_fetch_mapping)
def test_create_batch(api_client, redis_client, kafka_admin):
    url = reverse("batches-list")

    data = {"resources": ["foo", "bar"]}
    response = api_client.post(url, data, format="json")

    assert response.status_code == 201

    batch_id = response.json()["id"]

    batches = models.Batch.objects.all()
    assert len(batches) == 1
    assert batches[0].resources == ["foo", "bar"]

    # Check that mapping is stored
    mapping_foo = redis_client.get(f"{batch_id}:foo")
    assert json.loads(mapping_foo) == {"resource_id": "foo", "key": "mapping"}
    mapping_bar = redis_client.get(f"{batch_id}:bar")
    assert json.loads(mapping_bar) == {"resource_id": "bar", "key": "mapping"}

    # Check that topics are created
    topics = kafka_admin.list_topics().topics
    for base_topic in ["batch", "extract", "transform", "load"]:
        assert f"{base_topic}.{batch_id}" in topics

    # Check that events were sent
    # TODO


@pytest.fixture
def create_batch(api_client):
    """Batch factory to test the underlying topics."""

    def _create_batch(resources: List[str]):
        with mock.patch("river.api.views.APIPyrogClient.fetch_mapping", mock_fetch_mapping):
            url = reverse("batches-list")
            data = {"resources": resources}
            response = api_client.post(url, data, format="json")
            return response.json()["id"]

    yield _create_batch


def test_retrieve_batch(api_client, create_batch):
    batch_id = create_batch(resources=["foo", "bar"])
    url = reverse("batches-detail", kwargs={"pk": batch_id})

    response = api_client.get(url)

    assert response.status_code == 200
    assert response.json()["resources"] == ["foo", "bar"]
    assert response.json()["deleted_at"] is None


def test_delete_batch(api_client, create_batch, kafka_admin):
    batch_id = create_batch(resources=["foo"])
    url = reverse("batches-detail", kwargs={"pk": batch_id})

    response = api_client.delete(url)
    assert response.status_code == 204

    batches = models.Batch.objects.all()
    assert len(batches) == 1
    assert batches[0].deleted_at is not None

    # Check that topics are deleted
    topics = kafka_admin.list_topics().topics
    for base_topic in ["batch", "extract", "transform", "load"]:
        assert f"{base_topic}.{batch_id}" not in topics
