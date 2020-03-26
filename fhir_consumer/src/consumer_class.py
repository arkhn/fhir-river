#!/usr/bin/env python


from confluent_kafka import KafkaException, KafkaError, TopicPartition
from confluent_kafka.avro.serializer import SerializerError
from confluent_kafka.avro import AvroConsumer
from fhir_consumer.src.logger import create_logger

logging = create_logger('consumer_class')


class Consumer:

    def __init__(self,
                 broker=None,
                 registry=None,
                 topics=None,
                 group_id=None,
                 offset_start=-1,
                 process_event=None,
                 manage_error=None):
        """
        Instantiate the class and create the consumer object
        :param broker: host[:port]’ string (or list of ‘host[:port]’ strings) that the consumer should contact to
        bootstrap initial cluster metadata
        :param registry: string, avro registry url
        :param topics: string or list of strings corresponding to the topics to listen
        :param group_id: string
        :param offset_start: integer
        :param process_event: function taking as an argument an AVRO deserialized message to process the event
        :param manage_error: function taking as an argument an AVRO deserialized message to manage any error,
        and an error increment (int)
        """
        self.broker = broker
        self.registry = registry
        self.topics = topics
        self.group_id = group_id
        self.partition = 0
        self.offset_start = offset_start
        self.process_event = process_event
        self.manage_error = manage_error

        # Create consumer
        self.consumer = AvroConsumer(self._generate_config())

        if isinstance(self.topics, str):
            self.topics = [self.topics]

    def _generate_config(self):
        """
        Generate configuration dictionary for consumer
        :return:
        """
        config = {'bootstrap.servers': self.broker,
                  'group.id': self.group_id,
                  'schema.registry.url': self.registry,
                  'session.timeout.ms': 6000,
                  'auto.offset.reset': 'earliest'}
        return config

    def consume_event(self):
        """
        Consume event in an infinite loop
        :return:
        """
        while True:
            # Deserialize Event
            try:
                msg = self.consumer.poll(timeout=1.0)
            except SerializerError:
                # We get some messages without the "magic bytes"
                logging.error("SerializeError")
                continue

            # Process Event or Raise Error
            if msg is None:
                continue
            if msg.error():
                self.manage_error(msg)
            else:
                # Proper message
                self.process_event(msg)

    def run_consumer(self):
        """
        Create consumer, assign topics, consume and process events
        :return:
        """
        self.consumer.subscribe(self.topics)
        try:
            self.consume_event()
        except (KafkaException, KafkaError):
            raise
        finally:
            # Close down consumer to commit final offsets.
            self.consumer.close()
