import json
import logging
import time
from contextlib import contextmanager

from confluent_kafka import Consumer as KafkaConsumer
from confluent_kafka import KafkaError, KafkaException

logger = logging.getLogger("kafka.consumer")


class Consumer:
    def __init__(
        self,
        broker=None,
        topics=None,
        group_id=None,
    ):
        """
        Instantiate the class and create the consumer object
        :param broker: host[:port]’ string (or list of ‘host[:port]’ strings) that
        the consumer should contact to bootstrap initial cluster metadata
        :param topics: string or list of strings corresponding to the topics to listen
        :param group_id: string
        :param offset_start: integer
        :param process_event: function taking as an argument a deserialized message
            to process the event
        """
        self.broker = broker
        self.topics = topics
        self.group_id = group_id

        self.consumer = KafkaConsumer(self._generate_config())

        if isinstance(self.topics, str):
            self.topics = [self.topics]

    def _generate_config(self):
        """
        Generate configuration dictionary for consumer
        :return:
        """
        config = {
            "bootstrap.servers": self.broker,
            "group.id": self.group_id,
            "session.timeout.ms": 6000,
            # topic.metadata.refresh.interval.ms (default 5 min) is the period of time
            # in milliseconds after which we force a refresh of metadata.
            # Here we refresh the list of consumed topics every 5s.
            "topic.metadata.refresh.interval.ms": 5000,
            "auto.offset.reset": "earliest",
        }
        return config

    @contextmanager
    def subscribe(self):
        self.consumer.subscribe(self.topics)
        yield Subscription(self.consumer)
        self.consumer.close()


class Subscription:
    def __init__(self, consumer) -> None:
        self.consumer = consumer

    def __call__(self) -> dict:
        """Polls until a message's available for delivery"""
        while True:
            msg = self.consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if error := msg.error():
                logger.debug(error.str())
                self.handle_error(error)
                continue
            data = json.loads(msg.value())
            return data

    def handle_error(self, error: KafkaError):
        """Handles a KafkaError"""
        if error.retriable() or error.code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
            time.sleep(1)
        else:
            raise KafkaException(error)
