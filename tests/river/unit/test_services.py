import pytest

from river.adapters.event_publisher import InMemoryEventPublisher
from river.adapters.topics import InMemoryTopicsManager
from river.domain.events import BatchEvent
from river.services import abort, batch, preview
from syrupy.filters import paths

pytestmark = pytest.mark.django_db


def test_batch(batch_factory, resource_factory):
    resources = resource_factory.create_batch(2)
    batch_ = batch_factory.create(resources=resources)
    topics = InMemoryTopicsManager()
    publisher = InMemoryEventPublisher()

    batch(batch_.id, resources, topics, publisher)

    assert topics._topics == {f"{base_topic}.{batch_.id}" for base_topic in ["batch", "extract", "transform", "load"]}
    assert publisher._events[f"batch.{batch_.id}"] == [
        BatchEvent(batch_id=batch_.id, resource_id=resource.id) for resource in resources
    ]


def test_abort(batch):
    topics = InMemoryTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    abort(batch, topics)

    assert batch.canceled_at is not None
    assert topics._topics == set()


@pytest.mark.skip(reason="feature not implemented yet")
def test_retry(batch):
    pass


def test_preview(mimic_mapping, snapshot):
    # label: patient-resource-id
    resource_id = "cktlnp0f300300mmznmyqln70"
    documents, errors = preview(mimic_mapping, resource_id, [10006])

    assert len(errors) == 0
    assert len(documents) == 1
    assert documents[0] == snapshot(exclude=paths("meta.lastUpdated"))
