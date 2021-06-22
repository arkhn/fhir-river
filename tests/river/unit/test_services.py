import uuid

import pytest

from river import models, services
from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.topics import FakeTopics
from river.domain.events import BatchEvent

pytestmark = pytest.mark.django_db


@pytest.mark.skip(reason="Needs pyrog-api")
def test_batch():
    topics = FakeTopics()
    publisher = FakeEventPublisher()
    resources = [str(uuid.uuid4()) for _ in range(5)]

    batch_instance = services.batch(resources, topics, publisher)

    assert batch_instance is not None
    assert models.Batch.objects.filter(id=batch_instance.id).exists()
    assert topics._topics == {
        f"{base_topic}.{batch_instance.id}" for base_topic in ["batch", "extract", "transform", "load"]
    }
    assert publisher._events[f"batch.{batch_instance.id}"] == {
        BatchEvent(batch_id=batch_instance.id, resource_id=r) for r in resources
    }


def test_abort(batch):
    topics = FakeTopics(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    services.abort(batch, topics)

    assert batch.deleted_at is not None
    assert topics._topics == set()


def test_retry(batch):
    pass
