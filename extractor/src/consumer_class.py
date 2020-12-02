#!/usr/bin/env python

from confluent_kafka import KafkaException, KafkaError
from confluent_kafka import Consumer
from extractor.src.config.service_logger import logger
from confluent_kafka.admin import AdminClient


class ExtractorConsumer:
    def __init__(
        self,
        broker=None,
        topics=None,
        group_id=None,
        offset_start=-1,
        process_event=None,
        manage_error=None,
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
        :param manage_error: function taking as an argument adeserialized message
            to manage any error
        """
        self.broker = broker
        self.topics = topics
        self.group_id = group_id
        self.offset_start = offset_start
        self.process_event = process_event
        self.manage_error = manage_error
        self.kadmin = AdminClient({"bootstrap.servers": self.broker})

        # Create consumer
        self.consumer = Consumer(self._generate_config())

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
            # metadata.max.age.ms (default 5 min) is the period of time in milliseconds after which
            # we force a refresh of metadata. Here we refresh the list of consumed topics every 5s.
            'metadata.max.age.ms': 5000,
            "auto.offset.reset": "smallest",
        }
        return config

    def consume_event(self):
        """
        Consume event in an infinite loop
        :return:
        """
        while True:
            # Deserialize Event
            msg = self.consumer.poll(timeout=5.0)
            md = self.kadmin.list_topics()
            for t in iter(md.values()):
                logger.info(f"Kafka topics: {t}")
            # Process Event or Raise Error
            if msg is None:
                continue
            if msg.error():
                self.manage_error(msg)
            else:
                logger.info(f"Message received from KafKa: {msg}")
                # Proper message
                self.process_event(msg)

    def run_consumer(self):
        """
        Create consumer, assign topics, consume and process events
        :return:
        """
        def on_assign(c, ps):
            for p in ps:
                p.offset = -2
                logger.info(f"Assign Kafka partition {p}")
            c.assign(ps)
        logger.info(f"Subscribing to topics {self.topics}")
        self.consumer.subscribe(self.topics, on_assign=on_assign)
        try:
            self.consume_event()
        except (KafkaException, KafkaError):
            raise
        finally:
            # Close down consumer to commit final offsets.
            self.consumer.close()
