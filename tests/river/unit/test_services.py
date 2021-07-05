import uuid

import pytest

from river import models
from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.mappings import FakeMappingsRepository
from river.adapters.pyrog_client import FakePyrogClient
from river.adapters.topics import FakeTopicsManager
from river.domain.events import BatchEvent
from river.services import abort, batch, preview

pytestmark = pytest.mark.django_db


def test_batch():
    topics = FakeTopicsManager()
    publisher = FakeEventPublisher()
    resources = [str(uuid.uuid4()) for _ in range(5)]
    pyrog_client = FakePyrogClient(mappings={id: {} for id in resources})
    mappings_repo = FakeMappingsRepository()

    batch_instance = batch(resources, topics, publisher, pyrog_client, mappings_repo)

    assert batch_instance is not None
    assert models.Batch.objects.filter(id=batch_instance.id).exists()
    assert topics._topics == {
        f"{base_topic}.{batch_instance.id}" for base_topic in ["batch", "extract", "transform", "load"]
    }
    assert publisher._events[f"batch.{batch_instance.id}"] == [
        BatchEvent(batch_id=batch_instance.id, resource_id=r) for r in resources
    ]
    assert pyrog_client._seen == resources
    assert mappings_repo._mappings == {f"{batch_instance.id}:{resource_id}": "{}" for resource_id in resources}


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
def test_preview(users_to_patients_mapping):
    pyrog_client = FakePyrogClient(mappings={"foo": users_to_patients_mapping})

    documents, errors = preview("foo", None, pyrog_client=pyrog_client)

    assert pyrog_client._seen == ["foo"]
    assert len(errors) == 0
