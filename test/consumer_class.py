#!/usr/bin/env python


from confluent_kafka import KafkaException, KafkaError
from confluent_kafka import Consumer
from loader.src.config.logger import get_logger

logger = get_logger()


class EventConsumer:
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
        self.partition = 0  # One partition for now
        self.offset_start = offset_start
        self.process_event = process_event
        self.manage_error = manage_error

        # Create consumer
        self.consumer = Consumer(self._generate_config())

        if isinstance(self.topics, str):
            self.topics = [self.topics]

        logger.info(f"subscribed to {self.topics}")
        self.consumer.subscribe(self.topics)

    def _generate_config(self):
        """
        Generate configuration dictionary for consumer
        :return:
        """
        config = {
            "bootstrap.servers": self.broker,
            "group.id": self.group_id,
            "session.timeout.ms": 6000,
            "auto.offset.reset": "earliest",
        }
        return config

    def consume_event(self, poll_timeout=None):
        """
        Consume event in an infinite loop
        :return:
        """
        # Deserialize Event
        msg = self.consumer.poll(timeout=poll_timeout)

        # Process Event or Raise Error
        if msg is None:
            raise Exception(f"consumer timed out after {poll_timeout} seconds")

        if msg.error():
            self.manage_error(msg)
        elif self.process_event:
            self.process_event(msg)

    def consume_events(self, event_count=None, poll_timeout=None):
        if event_count:
            for i in range(event_count):
                self.consume_event(poll_timeout=poll_timeout)
                logger.info(f"consumed {i+1} events")
        else:
            while True:
                self.consume_event()

    def run_consumer(self, event_count=None, poll_timeout=None):
        """
        Create consumer, assign topics, consume and process events
        :return:
        """
        try:
            self.consume_events(event_count, poll_timeout=poll_timeout)
        except (KafkaException, KafkaError):
            raise
        # finally:
        # Close down consumer to commit final offsets.
        # self.consumer.close()
