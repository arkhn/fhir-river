import uuid

import pytest

from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.topics import FakeTopicsManager
from river.domain.events import BatchEvent
from river.services import abort, batch, preview

pytestmark = pytest.mark.django_db


def test_batch():
    topics = FakeTopicsManager()
    publisher = FakeEventPublisher()
    batch_id = str(uuid.uuid4())
    resource_ids = [str(uuid.uuid4()) for _ in range(5)]

    batch(batch_id, resource_ids, topics, publisher)

    assert topics._topics == {f"{base_topic}.{batch_id}" for base_topic in ["batch", "extract", "transform", "load"]}
    assert publisher._events[f"batch.{batch_id}"] == [
        BatchEvent(batch_id=batch_id, resource_id=resource_id) for resource_id in resource_ids
    ]


def test_abort(batch):
    topics = FakeTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    abort(batch, topics)

    assert batch.deleted_at is not None
    assert topics._topics == set()


@pytest.mark.skip(reason="feature not implemented yet")
def test_retry(batch):
    pass


# TODO improve test to verify what's in documents
def test_preview(mimic_mapping):
    documents, errors = preview(mimic_mapping, None)

    assert len(errors) == 0
