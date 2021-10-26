import pytest

from django.urls import reverse

from river import models

pytestmark = [pytest.mark.django_db, pytest.mark.kafka]


def set_counters(redis_client, batch, r1, r2):
    redis_client.hset("extracted_counters", f"{batch.id}:{r1.id}", 10)
    redis_client.hset("loaded_counters", f"{batch.id}:{r1.id}", 5)
    redis_client.hset("extracted_counters", f"{batch.id}:{r2.id}", 20)
    redis_client.hset("loaded_counters", f"{batch.id}:{r2.id}", 5)
    redis_client.hset("failed_counters", f"{batch.id}:{r2.id}", 3)


def clear_counters(redis_client, batch, r1, r2):
    redis_client.delete("extracted_counters", f"{batch.id}:{r1.id}")
    redis_client.delete("loaded_counters", f"{batch.id}:{r1.id}")
    redis_client.delete("extracted_counters", f"{batch.id}:{r2.id}")
    redis_client.delete("loaded_counters", f"{batch.id}:{r2.id}")
    redis_client.delete("failed_counters", f"{batch.id}:{r2.id}")


def test_create_batch(api_client, resource_factory, kafka_admin):
    resources = resource_factory.create_batch(2)
    data = {"resources": [resource.id for resource in resources]}

    url = reverse("batches-list")
    response = api_client.post(url, data, format="json")

    assert response.status_code == 201, response.data

    batch_id = response.json()["id"]

    batches = models.Batch.objects.all()
    assert len(batches) == 1
    assert [resource.id for resource in batches[0].resources.all()] == [resource.id for resource in resources]

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


@pytest.mark.redis
def test_get_batch_progression(api_client, batch_factory, resource_factory, redis_client):
    url = reverse("batches-list")
    r1 = resource_factory.create(definition_id="Patient")
    r2 = resource_factory.create(definition_id="Practitioner")
    batch = batch_factory.create(resources=[r1, r2])

    set_counters(redis_client, batch, r1, r2)

    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 1
    batch_response = response.json()[0]
    assert batch_response["progressions"] == [
        ["Patient", {"extracted": 10, "loaded": 5, "failed": None}],
        ["Practitioner", {"extracted": 20, "loaded": 5, "failed": 3}],
    ]


def test_filter_batches_by_sources(api_client, batch_factory, source_factory, resource_factory):
    first_source, second_source = source_factory.create_batch(2)
    first_source_resources = resource_factory.create_batch(2, source=first_source)
    second_source_resources = resource_factory.create_batch(2, source=second_source)
    first_source_resources_batches = batch_factory.create_batch(2, resources=first_source_resources)
    batch_factory.create_batch(3, resources=second_source_resources)

    url = reverse("batches-list")
    response = api_client.get(url, {"source": [first_source.id]})

    assert response.status_code == 200, response.data
    assert {batch_data["id"] for batch_data in response.json()} == {
        batch.id for batch in first_source_resources_batches
    }


def test_retrieve_batch(api_client, batch_factory, resource_factory):
    resource_1, resource_2 = resource_factory.create_batch(2)
    batch = batch_factory.create(resources=[resource_1, resource_2])
    url = reverse("batches-detail", kwargs={"pk": batch.id})

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert {r for r in response.json()["resources"]} == {resource_1.id, resource_2.id}
    assert response.json()["completed_at"] is None


@pytest.mark.redis
def test_delete_batch(api_client, redis_client, batch_factory, resource_factory, kafka_admin):
    r1 = resource_factory.create(definition_id="Patient")
    r2 = resource_factory.create(definition_id="Practitioner")
    batch = batch_factory.create(resources=[r1, r2])
    url = reverse("batches-detail", kwargs={"pk": batch.id})

    set_counters(redis_client, batch, r1, r2)

    response = api_client.delete(url)
    assert response.status_code == 204, response.data

    clear_counters(redis_client, batch, r1, r2)

    response_get = api_client.get(url)
    print(response_get.json())
    assert response_get.json()["canceled_at"] is not None
    assert response_get.json()["progressions"] == [
        ["Patient", {"extracted": 10, "loaded": 5, "failed": None}],
        ["Practitioner", {"extracted": 20, "loaded": 5, "failed": 3}],
    ]

    # Check that topics are deleted
    topics = kafka_admin.list_topics().topics
    for base_topic in ["batch", "extract", "transform", "load"]:
        assert f"{base_topic}.{batch.id}" not in topics
