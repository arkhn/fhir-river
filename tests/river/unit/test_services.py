import pytest

from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.topics import FakeTopicsManager
from river.domain.events import BatchEvent
from river.services import abort, batch, preview

pytestmark = pytest.mark.django_db


def test_batch(batch_factory, resource_factory):
    resources = resource_factory.create_batch(2)
    batch_ = batch_factory.create(resources=resources)
    topics = FakeTopicsManager()
    publisher = FakeEventPublisher()

    batch(batch_.id, resources, topics, publisher)

    assert topics._topics == {f"{base_topic}.{batch_.id}" for base_topic in ["batch", "extract", "transform", "load"]}
    assert publisher._events[f"batch.{batch_.id}"] == [
        BatchEvent(batch_id=batch_.id, resource_id=resource.id) for resource in resources
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
