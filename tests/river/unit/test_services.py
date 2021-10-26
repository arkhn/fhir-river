import pytest

from river import models
from river.adapters.event_publisher import InMemoryEventPublisher
from river.adapters.progression_counter import InMemoryProgressionCounter
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


def test_abort(batch_factory, resource_factory):
    r1 = resource_factory.create(definition_id="Patient")
    r2 = resource_factory.create(definition_id="Practitioner")
    batch = batch_factory.create(resources=[r1, r2])

    topics = InMemoryTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )
    counter = InMemoryProgressionCounter(
        {
            f"{batch.id}:{r1.id}": {"extracted": 100, "loaded": 20, "failed": 3},
            f"{batch.id}:{r2.id}": {"extracted": 200, "loaded": 10, "failed": None},
        },
    )
    abort(batch, topics, counter)

    assert topics._topics == set()
    assert batch.canceled_at is not None
    r1_progressions = models.Progression.objects.filter(batch=batch, resource=r1)
    assert len(r1_progressions) == 1
    assert r1_progressions[0].extracted == 100
    assert r1_progressions[0].loaded == 20
    assert r1_progressions[0].failed == 3
    r2_progressions = models.Progression.objects.filter(batch=batch, resource=r2)
    assert len(r2_progressions) == 1
    assert r2_progressions[0].extracted == 200
    assert r2_progressions[0].loaded == 10
    assert r2_progressions[0].failed is None


@pytest.mark.skip(reason="feature not implemented yet")
def test_retry(batch):
    pass


def test_preview(mimic_mapping, snapshot):
    # label: patient-resource-id
    resource_id = "cktlnp0f300300mmznmyqln70"
    documents, errors = preview(mimic_mapping, resource_id, [10006], "authtokenxxx")

    assert len(errors) == 0
    assert len(documents) == 1
    assert documents[0] == snapshot(exclude=paths("meta.lastUpdated"))
