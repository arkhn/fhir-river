import json
import logging
import time
from contextlib import contextmanager
from typing import Any, Dict, List, Tuple

import confluent_kafka
from confluent_kafka import KafkaError, KafkaException

from django.conf import settings

logger = logging.getLogger(__name__)


class EventSubscriber:
    """Abstract class used to fetch events used by the ETL services to communicate.

    An EventSubscriber should have 2 methods:
        - subscribe: a contextmanager inside of which we can poll events
        - poll: which is used to retrieve events

    """

    @contextmanager
    def subscribe(self, topics: List[str]):
        raise NotImplementedError

    def poll(self):
        raise NotImplementedError


class FakeEventSubscriber(EventSubscriber):
    """EventSubscriber using an in-memory dict of lists as a data structure.

    Instead of relying on a complex message broker in basic tests, we mock such a system
    with this class which basically wraps a dict.

    Typical usage:
        subscriber = FakeEventSubscriber(...)
        with subscriber.subscribe(["foo"]):
            topic, data = subscriber.poll()

    Attributes:
        _events (dict of str: list): data structure used to mimic a broker. Each item
            represents a topic where the key is the topic name and the associated a
            queue of events implemented with a simple list.
        _seen (list): used in tests to check which events have been read by the
            subscriber instance.

    """

    def __init__(self, events: Dict[str, List[dict]]):
        self._events = events
        self._seen = []

    @contextmanager
    def subscribe(self, topics: List[str]):
        """The subscribtion context manager.

        Args:
            topics (list of str): A list of strings that are names of the topics to
                subscribe to.

        """
        self.topics = topics
        yield self

    def poll(self):
        """Method used to actually retrieve events."""
        for topic in self.topics:
            if topic_events := self._events[topic]:
                curr = topic_events.pop(0)
                self._seen.append(curr)
                return curr


class KafkaEventSubscriber(EventSubscriber):
    """EventSubscriber using kafka as a backend, used in real-life ETL runs.

    Typical usage:
        subscriber = FakeEventSubscriber(...)
        with subscriber.subscribe(["foo"]):
            topic, data = subscriber.poll()

    Attributes:
        _kafka_consumer (confluent_kafka.Consumer): KafkaEventSubscriber wraps a
            confluent_kafka.Consumer that is used to poll events.
    """

    def __init__(self, group_id: str):
        """
        Args:
            group_id (str): the id of the group the kafka consumer associated to the
                subscriber should be in.
        """
        self._kafka_consumer = confluent_kafka.Consumer(
            {
                "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
                "group.id": group_id,
                "linger.ms": 0.5,
                "session.timeout.ms": 6000,
                # topic.metadata.refresh.interval.ms (default 5 min) is the period of
                # time in milliseconds after which we force a refresh of metadata.
                # Here we refresh the list of consumed topics every 5s.
                "topic.metadata.refresh.interval.ms": 5000,
                "auto.offset.reset": "earliest",
            }
        )

    @contextmanager
    def subscribe(self, topics: List[str]):
        """The subscribtion context manager.

        Args:
            topics (list of str): A list of strings that are names of the topics to
                subscribe to.

        """
        self._kafka_consumer.subscribe(topics)
        yield self
        self._kafka_consumer.close()

    def poll(self) -> Tuple[str, Any]:
        """Polls until a message's available for delivery"""
        while True:
            msg = self._kafka_consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if error := msg.error():
                logger.debug(error.str())
                self._handle_error(error)
                continue
            return msg.topic(), json.loads(msg.value())

    def _handle_error(self, error: KafkaError):
        """Handles a KafkaError"""
        if error.retriable() or error.code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
            time.sleep(1)
        else:
            raise KafkaException(error)
