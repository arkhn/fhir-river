import uuid

import pytest

from common.analyzer import Analyzer
from extractor.service import batch_resource_handler
from river.adapters.decr_counter import FakeDecrementingCounter
from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.mappings import FakeMappingsRepository
from river.domain.events import BatchEvent, ExtractedRecord

pytestmark = pytest.mark.django_db


@pytest.mark.skip(reason="Needs more work")
def test_batch_resource_handler(batch, patient_mapping):
    resource_id = str(uuid.uuid4())
    event = BatchEvent(batch_id=batch.id, resource_id=resource_id)
    publisher, counter, mappings_repo = (
        FakeEventPublisher(),
        FakeDecrementingCounter(),
        FakeMappingsRepository({resource_id: patient_mapping}),
    )
    analyzer = Analyzer()

    batch_resource_handler(event, publisher, counter, analyzer, mappings_repo)

    assert publisher._events == {
        ExtractedRecord(batch_id=batch.id, resource_type="", resource_id=resource_id, record="")
    }
    assert counter.get(f"{batch.id}:{resource_id}") == 10
