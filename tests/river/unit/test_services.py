import pytest

from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.topics import FakeTopicsManager
from river.domain.events import BatchEvent
from river.services import abort, batch, preview

pytestmark = pytest.mark.django_db


def test_batch(batch_factory, resource_factory):
    r1, r2 = resource_factory.create_batch(2)
    b = batch_factory.create(resources=(r1, r2))
    topics = FakeTopicsManager()
    publisher = FakeEventPublisher()

    batch(b.id, [r1, r2], topics, publisher)

    assert topics._topics == {f"{base_topic}.{b.id}" for base_topic in ["batch", "extract", "transform", "load"]}
    assert publisher._events[f"batch.{b.id}"] == [
        BatchEvent(batch_id=b.id, resource_id=resource_id) for resource_id in [r1.id, r2.id]
    ]


def test_abort(batch):
    topics = FakeTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    abort(batch, topics)

    assert batch.canceled_at is not None
    assert topics._topics == set()


@pytest.mark.skip(reason="feature not implemented yet")
def test_retry(batch):
    pass


# TODO improve test to verify what's in documents
def test_preview(mimic_mapping):
    documents, errors = preview(mimic_mapping, mimic_mapping["resources"][0]["id"], None)

    assert len(errors) == 0
