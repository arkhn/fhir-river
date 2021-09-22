import logging
import time

from confluent_kafka.admin import AdminClient

from fhirpy import SyncFHIRClient

from . import settings

logger = logging.getLogger(__file__)


def test_batch(batch):
    # Test if the batch topics have been deleted
    # At the end of a batch, its topics are deleted from Kafka
    # NOTE with the Python API, topics are only marked as "to delete" and the operation
    # is asynchronous. Thus, we sleep.
    time.sleep(10)
    batch_topics = [
        f"batch.{batch['id']}",
        f"extract.{batch['id']}",
        f"transform.{batch['id']}",
        f"load.{batch['id']}",
    ]
    topics = AdminClient({"bootstrap.servers": settings.KAFKA_LISTENER}).list_topics().topics
    assert not set(batch_topics) & set(topics)


def test_batch_reference_binder(batch, fhir_client: SyncFHIRClient):
    bundle = (
        fhir_client.resources("Observation")
        .limit(settings.MAX_RESOURCE_COUNT)
        .include("Observation", "subject")
        .fetch_raw()
    )
    for entry in [e for e in bundle.entry if e.search.mode == "match"]:
        observation = entry.resource
        if "reference" not in observation.subject:
            raise Exception(f"missing 'reference' attribute in observation.subject: {observation.subject}")
        ref_id = observation.subject.reference.split("/")[1]
        assert any(
            entry.resource.id == ref_id for entry in bundle.entry if entry.search.mode == "include"
        ), f"missing referenced resource {observation.subject.reference}"
