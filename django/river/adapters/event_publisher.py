import dataclasses
import json
import logging

import confluent_kafka

from django.conf import settings

from river.domain.events import Event

logger = logging.getLogger(__name__)


class EventPublisher:
    def publish(self, topic: str, event: Event):
        raise NotImplementedError


class FakeEventPublisher(EventPublisher):
    def __init__(self):
        self._events: dict[str, set] = {}

    def publish(self, topic: str, event: Event):
        if topic in self._events:
            self._events[topic].add(event)
        else:
            self._events[topic] = {event}


class KafkaEventPublisher(EventPublisher):
    def __init__(
        self,
    ):
        self._kafka_producer = confluent_kafka.Producer(
            {
                "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
                "linger.ms": 0.5,
                "session.timeout.ms": 6000,
            }
        )

    def publish(self, topic: str, event: Event):
        self._kafka_producer.produce(
            topic=topic,
            value=json.dumps(dataclasses.asdict(event)),
            callback=lambda err, msg: logger.debug("Message delivered")
            if err is None
            else logger.error(f"Message {event} delivery failed with error {err} for topic {msg.topic()}"),
        )
        self._kafka_producer.poll(1)
