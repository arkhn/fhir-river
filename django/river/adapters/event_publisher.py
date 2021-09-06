import dataclasses
import json
import logging
from typing import Dict

import confluent_kafka

from django.conf import settings

from river.domain.events import Event
from utils.json import CustomJSONEncoder

logger = logging.getLogger(__name__)


class EventPublisher:
    """Abstract class used to publish events used by the ETL services to communicate."""

    def publish(self, topic: str, event: Event):
        """Publish the provided event to a topic named `topic`.

        Args:
            topic (str): The name of the topic which the event needs to be sent to.
            event (Event): The event to publish.

        """
        raise NotImplementedError


class FakeEventPublisher(EventPublisher):
    """EventPublisher using an in-memory dict of lists as a data structure.

    Instead of relying on a complex message broker in basic tests, we mock such a system
    with this class which basically wraps a dict.

    Attributes:
        _events (dict of str: list): data structure used to mimic a broker. Each item
            represents a topic where the key is the topic name and the associated a
            queue of events implemented with a simple list.

    """

    def __init__(self):
        self._events: Dict[str, list] = {}

    def publish(self, topic: str, event: Event):
        """Publish the provided event to a topic named `topic`.

        Args:
            topic (str): The name of the topic which the event needs to be sent to.
            event (Event): The event to publish.

        """
        if topic in self._events:
            self._events[topic].append(event)
        else:
            self._events[topic] = [event]


class KafkaEventPublisher(EventPublisher):
    """EventPublisher using kafka as a backend, used in real-life ETL runs.

    Attributes:
        _kafka_producer (confluent_kafka.Producer): the kafka producer that will publish
            the events. Its configuration is set in the class constructor.

    """

    def __init__(self):
        self._kafka_producer = confluent_kafka.Producer(
            {
                "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
                "linger.ms": 0.5,
                "session.timeout.ms": 6000,
            }
        )

    def publish(self, topic: str, event: Event):
        """Publish the provided event to a topic named `topic`.

        Args:
            topic (str): The name of the topic which the event needs to be sent to.
            event (Event): The event to publish.

        """
        self._kafka_producer.produce(
            topic=topic,
            value=json.dumps(dataclasses.asdict(event), cls=CustomJSONEncoder),
            callback=lambda err, msg: logger.debug("Message delivered")
            if err is None
            else logger.error(f"Message {event} delivery failed with error {err} for topic {msg.topic()}"),
        )
        self._kafka_producer.poll(1)
