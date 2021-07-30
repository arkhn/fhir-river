import pytest

from river.adapters.event_publisher import FakeEventPublisher
from river.common.analyzer import Analyzer
from river.domain.events import ExtractedRecord, TransformedRecord
from river.transformer.reference_binder import ReferenceBinder
from river.transformer.service import extracted_record_handler
from river.transformer.transformer import Transformer

pytestmark = pytest.mark.django_db


def test_extracted_resource_handler(batch, mimic_mapping):
    resource_id = mimic_mapping["resources"][0]["id"]
    event = ExtractedRecord(
        batch_id=batch.id,
        resource_type="",
        resource_id=resource_id,
        record={"patients_subject_id_a9fb9667": "didier@chloroquine.org"},
    )
    publisher = FakeEventPublisher()
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
    event = publisher._events[f"transform.{batch.id}"][0]
    assert publisher._events[f"transform.{batch.id}"] == [
        TransformedRecord(
            batch_id=batch.id,
            resource_id=resource_id,
            fhir_object={
                "name": [{"given": ["Jean", "Georges"]}],
                "identifier": [
                    {"system": "http://terminology.arkhn.org/b8efd322-3e38-4072-9c68-e62e15d84d04", "value": "d"}
                ],
                "id": "6629d2aa-aec0-5117-9da3-de8b7b0a4c4e",
                "resourceType": "Patient",
                "meta": {
                    "lastUpdated": event.fhir_object["meta"]["lastUpdated"],
                    "tag": [
                        {
                            "system": "http://terminology.arkhn.org/CodeSystem/source",
                            "code": "ckrowsirw00091lpd4jph0861",
                        },
                        {
                            "system": "http://terminology.arkhn.org/CodeSystem/resource",
                            "code": "ckrowsivi00181lpdfod4jpz8",
                        },
                    ],
                },
            },
        )
    ]
