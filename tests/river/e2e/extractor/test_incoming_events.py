import pytest

from river.adapters.event_publisher import KafkaEventPublisher
from river.adapters.event_subscriber import KafkaEventSubscriber
from river.domain.events import BatchResource

pytestmark = [pytest.mark.django_db, pytest.mark.kafka]


@pytest.mark.skip(reason="Needs more work")
def test_resource_batch(batch):
    kafka_publisher = KafkaEventPublisher()
    kafka_subscriber = KafkaEventSubscriber(group_id="foo")

    kafka_publisher.publish(f"batch.{batch.id}", BatchResource(batch_id=batch.id, resource_id="foo"))

    # TODO:
    # - start extractor service in a thread
    # - use mapping
    # - add SQLite inmemory DB for extraction

    with kafka_subscriber.subscribe([f"extract.{batch.id}"]):
        kafka_subscriber.poll()