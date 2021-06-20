import pytest

from river import models
from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.topics import FakeTopics
from river.domain.events import BatchResource
from river.services import abort, batch, preview
from utils.caching import InMemoryCacheBackend

pytestmark = pytest.mark.django_db


def test_batch(mappings):
    topics = FakeTopics()
    publisher = FakeEventPublisher()
    cache = InMemoryCacheBackend()

    batch_instance = batch(mappings, topics, publisher, cache)

    assert batch_instance is not None
    assert models.Batch.objects.filter(id=batch_instance.id).exists()
    assert batch_instance.mappings == mappings
    assert topics._topics == {
        f"{base_topic}.{batch_instance.id}" for base_topic in ["batch", "extract", "transform", "load"]
    }
    assert publisher._events[f"batch.{batch_instance.id}"] == [
        BatchResource(batch_id=batch_instance.id, resource_id=mapping_id)
        for mapping_id in [mapping["id"] for mapping in mappings["resources"]]
    ]
    assert all(
        cache.get(f"{batch_instance.id}.{mapping_id}") is not None
        for mapping_id in [mapping["id"] for mapping in mappings["resources"]]
    )


def test_abort(batch):
    topics = FakeTopics(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    abort(batch, topics)

    assert batch.deleted_at is not None
    assert topics._topics == set()


def test_retry(batch):
    pass


def test_preview(mappings):
    documents, errors = preview(mappings, None)

    assert len(errors) == 0
