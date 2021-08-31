import pytest

from django.urls import reverse

from river import models

pytestmark = [pytest.mark.django_db, pytest.mark.kafka]


def test_create_batch(api_client, resource_factory, kafka_admin):
    resources = resource_factory.create_batch(2)
    data = {"resources": [resource.id for resource in resources]}

    url = reverse("batches-list")
    response = api_client.post(url, data, format="json")

    assert response.status_code == 201

    batch_id = response.json()["id"]

    batches = models.Batch.objects.all()
    assert len(batches) == 1
    assert batches[0].resources == [resource.id for resource in resources]

    # Check that topics are created
    topics = kafka_admin.list_topics().topics
    for base_topic in ["batch", "extract", "transform", "load"]:
        assert f"{base_topic}.{batch_id}" in topics

    # Check that events were sent
    # TODO


def test_list_batch(api_client, batch_factory):
    url = reverse("batches-list")
    batch_factory.create_batch(3)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 3


def test_filter_batches_by_source(api_client, batch_factory, source_factory, resource_factory):
    first_source, second_source = source_factory.create_batch(2)
    first_source_resources = resource_factory.create_batch(2, source=first_source)
    second_source_resources = resource_factory.create_batch(2, source=second_source)
    first_source_resources_batches = batch_factory.create_batch(2, resources=first_source_resources)
    batch_factory.create_batch(3, resources=second_source_resources)

    url = reverse("batches-list")
    response = api_client.get(url, {"source": first_source.id})

    assert response.status_code == 200
    assert {batch_data["id"] for batch_data in response.json()} == {
        batch.id for batch in first_source_resources_batches
    }


def test_retrieve_batch(api_client, create_batch):
    batch_id = create_batch(resources=["foo", "bar"])
    url = reverse("batches-detail", kwargs={"pk": batch_id})

    response = api_client.get(url)

    assert response.status_code == 200
    assert response.json()["resources"] == ["foo", "bar"]
    assert response.json()["completed_at"] is None


def test_delete_batch(api_client, batch_factory, kafka_admin):
    batch = batch_factory.create_batch(1)
    batch_id = batch.id
    url = reverse("batches-detail", kwargs={"pk": batch_id})

    response = api_client.delete(url)
    assert response.status_code == 204

    batches = models.Batch.objects.all()
    assert len(batches) == 1
    assert batches[0].completed_at is not None

    # Check that topics are deleted
    topics = kafka_admin.list_topics().topics
    for base_topic in ["batch", "extract", "transform", "load"]:
        assert f"{base_topic}.{batch_id}" not in topics
