from dataclasses import dataclass

import pytest

from river.adapters.event_publisher import KafkaEventPublisher
from river.adapters.event_subscriber import KafkaEventSubscriber
from river.domain.events import Event

pytestmark = pytest.mark.kafka


@dataclass(frozen=True)
class FooEvent(Event):
    data: str


def test_can_publish_and_subscribe():
    publisher = KafkaEventPublisher()
    subscriber = KafkaEventSubscriber(group_id="foo")

    event = FooEvent(data="foo")
    publisher.publish("foo", event)

    with subscriber.subscribe("foo"):
        data = subscriber.poll()
        assert FooEvent(**data) == event
