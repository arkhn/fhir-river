import pytest

from river.adapters.event_publisher import FakeEventPublisher
from river.adapters.mappings import FakeMappingsRepository
from river.common.analyzer import Analyzer
from river.domain.events import ExtractedRecord, TransformedRecord
from river.transformer.reference_binder import ReferenceBinder
from river.transformer.service import extracted_record_handler
from river.transformer.transformer import Transformer

pytestmark = pytest.mark.django_db


def test_extracted_resource_handler(batch, users_to_patients_mapping):
    resource_id = users_to_patients_mapping["id"]
    event = ExtractedRecord(
        batch_id=batch.id,
        resource_type="",
        resource_id=resource_id,
        record={"users_user_email_b77906f9": "didier@chloroquine.org"},
    )
    publisher, mappings_repo = (
        FakeEventPublisher(),
        FakeMappingsRepository({resource_id: users_to_patients_mapping}),
    )
    analyzer = Analyzer()
    transformer = Transformer()
    binder = ReferenceBinder()

    extracted_record_handler(
        event=event,
        publisher=publisher,
        analyzer=analyzer,
        transformer=transformer,
        binder=binder,
        mappings_repo=mappings_repo,
    )

    assert f"transform.{batch.id}" in publisher._events
    event = publisher._events[f"transform.{batch.id}"][0]
    assert publisher._events[f"transform.{batch.id}"] == [
        TransformedRecord(
            batch_id=batch.id,
            resource_id=resource_id,
            fhir_object={
                "active": True,
                "id": "3c3c2451-68e2-5aab-8b49-2f278f7108da",
                "resourceType": "Patient",
                "meta": {
                    # hacky. The field should be properply ignore in comparison.
                    "lastUpdated": event.fhir_object["meta"]["lastUpdated"],
                    "tag": [
                        {"system": "http://terminology.arkhn.org/CodeSystem/source", "code": "source_001"},
                        {"system": "http://terminology.arkhn.org/CodeSystem/resource", "code": "resource_001"},
                    ],
                },
            },
        )
    ]
