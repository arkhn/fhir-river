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
    @contextmanager
    def subscribe(self, topic: str):
        raise NotImplementedError

    def poll(self):
        raise NotImplementedError


class FakeEventSubscriber(EventSubscriber):
    def __init__(self, events: Dict[str, List[dict]]):
        self._events = events
        self._seen = []

    @contextmanager
    def subscribe(self, topic: str):
        self.topic = topic
        yield self

    def poll(self):
        curr = self._events[self.topic].pop(0)
        self._seen.append(curr)
        return curr


class KafkaEventSubscriber(EventSubscriber):
    def __init__(self, group_id: str):
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
