import pytest

from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.mappings import FakeMappingsRepository
from river.adapters.progression_counter import FakeProgressionCounter
from river.common.analyzer import Analyzer
from river.domain.events import BatchEvent, ExtractedRecord
from river.extractor.service import batch_resource_handler

pytestmark = pytest.mark.django_db


def test_batch_resource_handler(batch, users_to_patients_mapping):
    resource_id = users_to_patients_mapping["id"]
    event = BatchEvent(batch_id=batch.id, resource_id=resource_id)
    publisher = FakeEventPublisher()
    counter = FakeProgressionCounter()
    mappings_repo = FakeMappingsRepository({f"{batch.id}:{resource_id}": users_to_patients_mapping})
    analyzer = Analyzer()

    batch_resource_handler(event, publisher, counter, analyzer, mappings_repo)

    assert f"extract.{batch.id}" in publisher._events
    assert len(publisher._events[f"extract.{batch.id}"]) > 0
    assert all([isinstance(event, ExtractedRecord) for event in publisher._events[f"extract.{batch.id}"]])
    assert counter.get(f"{batch.id}:{resource_id}") == (len(publisher._events[f"extract.{batch.id}"]), None)
