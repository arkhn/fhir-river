import pytest

from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.progression_counter import FakeProgressionCounter, Progression
from river.common.analyzer import Analyzer
from river.domain.events import BatchEvent, ExtractedRecord
from river.extractor.service import batch_resource_handler

pytestmark = pytest.mark.django_db


def test_batch_resource_handler(batch, mimic_mapping):
    # FIXME: use a dedicated fixture for the patient mapping
    # instead of the first resource of mimic mappings.
    resource_id = mimic_mapping["resources"][0]["id"]
    event = BatchEvent(batch_id=batch.id, resource_id=resource_id)
    publisher = FakeEventPublisher()
    counter = FakeProgressionCounter()
    analyzer = Analyzer()

    batch_resource_handler(event, publisher, counter, analyzer)

    assert f"extract.{batch.id}" in publisher._events
    assert len(publisher._events[f"extract.{batch.id}"]) > 0
    assert all([isinstance(event, ExtractedRecord) for event in publisher._events[f"extract.{batch.id}"]])
    assert counter.get(f"{batch.id}:{resource_id}") == Progression(
        extracted=len(publisher._events[f"extract.{batch.id}"]), loaded=None, failed=None
    )
