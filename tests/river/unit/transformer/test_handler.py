import datetime

import pytest

from river.adapters.event_publisher import InMemoryEventPublisher
from river.common.analyzer import Analyzer
from river.domain.events import ExtractedRecord
from river.transformer.reference_binder import ReferenceBinder
from river.transformer.service import extracted_record_handler
from river.transformer.transformer import Transformer
from syrupy.filters import paths

pytestmark = pytest.mark.django_db


def test_extracted_resource_handler(batch_factory, mimic_mapping, snapshot):
    # FIXME: use a dedicated fixture for the patient mapping
    # instead of the first resource of mimic mappings.
    resource_id = "ckt4kpz1800u63hvz7p1wf9xi"

    batch = batch_factory.create(id="test-batch-id")
    event = ExtractedRecord(
        batch_id=batch.id,
        resource_type="",
        resource_id=resource_id,
        record={
            "patients_subject_id_a9fb9667": ["didier@chloroquine.org"],
            "patients_gender_8035bbd1": ["F"],
            "patients_dob_f873eb32": [datetime.datetime(2057, 11, 15, 0, 0)],
            "patients_dod_9fd82e01": [datetime.datetime(2114, 2, 20, 0, 0)],
        },
    )
    publisher = InMemoryEventPublisher()
    analyzer = Analyzer()
    transformer = Transformer()
    binder = ReferenceBinder()

    extracted_record_handler(
        event=event,
        publisher=publisher,
        analyzer=analyzer,
        transformer=transformer,
        binder=binder,
    )

    assert f"transform.{batch.id}" in publisher._events
    assert publisher._events[f"transform.{batch.id}"][0].fhir_object == snapshot(exclude=paths("meta.lastUpdated"))
