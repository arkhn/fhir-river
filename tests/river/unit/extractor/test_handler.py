import pytest

from river.adapters.decr_counter import FakeDecrementingCounter
from river.adapters.event_publisher import FakeEventPublisher
from river.common.analyzer import Analyzer
from river.domain.events import BatchResource, ExtractedRecord
from river.extractor.service import batch_resource_handler
from utils.caching import InMemoryCacheBackend

pytestmark = pytest.mark.django_db


@pytest.mark.skip(reason="Needs a fake source db.")
def test_batch_resource_handler(batch, mappings):
    resource_id = mappings["resources"][0]["id"]
    event = BatchResource(batch_id=batch.id, resource_id=resource_id)
    publisher, counter, cache = (
        FakeEventPublisher(),
        FakeDecrementingCounter(),
        InMemoryCacheBackend({f"{batch.id}.{resource_id}": mappings}),
    )
    analyzer = Analyzer()

    batch_resource_handler(event, publisher, counter, analyzer, cache)

    assert f"extract.{batch.id}" in publisher._events
    assert len(publisher._events[f"extract.{batch.id}"]) > 0
    assert all([isinstance(event, ExtractedRecord) for event in publisher._events[f"extract.{batch.id}"]])
    assert counter.get(f"{batch.id}:{resource_id}") == len(publisher._events[f"extract.{batch.id}"])
