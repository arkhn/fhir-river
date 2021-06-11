import pytest

from river.adapters.event_publisher import KafkaEventPublisher
from river.adapters.event_subscriber import KafkaEventSubscriber
from river.domain.events import ExtractedRecord

pytestmark = [pytest.mark.django_db, pytest.mark.kafka]


@pytest.mark.skip(reason="Needs more work")
def test_resource_batch(batch):
    kafka_publisher = KafkaEventPublisher()
    kafka_subscriber = KafkaEventSubscriber(group_id="foo")

    kafka_publisher.publish(
        f"extract.{batch.id}",
        ExtractedRecord(
            batch_id=batch.id,
            resource_type="foo",
            resource_id="foo",
            record={"users_user_email_b77906f9": "didier@chloroquine.org"},
        ),
    )

    # TODO:
    # - start transformer service in a thread
    # - use mapping

    with kafka_subscriber.subscribe([f"transform.{batch.id}"]):
        kafka_subscriber.poll()
