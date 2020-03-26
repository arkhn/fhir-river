#!/usr/bin/env python


from datetime import datetime
import time
from confluent_kafka import KafkaException, KafkaError, TopicPartition
from confluent_kafka.avro.serializer import SerializerError
from confluent_kafka.avro import AvroConsumer
from fhir_consumer.src.logger import create_logger

logging = create_logger('consumer_class')


class POETAConsumer:

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

        self.first_event = None
        self.error_count = 0
        self.event_count = 0

        # Create consumer
        self.consumer = AvroConsumer(self._generate_config())

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

    def _print_stats(self):
        """
        Print Statistics
        :return:
        """
        elapsed_time = (datetime.now() - self.first_event).total_seconds()
        logging.info("total time : {}".format(elapsed_time))
        logging.info("events processed : {}".format(self.event_count))
        logging.info("rate : {}".format(self.event_count / elapsed_time))

    def create_topic_partitions(self):
        """
        Create Topic partitions with offset
        :return:
        """
        if isinstance(self.topics, str):
            self.topics = [self.topics]

        topic_partitions = [TopicPartition(topic=topic, partition=self.partition) for topic in self.topics]
        topic_partitions = self.set_offset(topic_partitions)
        return topic_partitions

    def set_offset(self, topic_partitions):
        """
        Set offset per partition
        :return:
        """
        for x in topic_partitions:
            x.offset = self.offset_start

        # Try 3 times to set the offset, with 5 sec between each attempts
        for i in range(0, 3):
            try:
                topic_partitions_with_offset = self.consumer.offsets_for_times(partitions=topic_partitions, timeout=5)
                return topic_partitions_with_offset
            except (KafkaException, KafkaError) as error:
                logging.info("Error Setting the Offset: %s", error)
                time.sleep(5)
                continue
        raise KafkaException

    def assign_topics(self, topic_partitions_with_offset):
        """
        Assign Topics to consumer
        :return:
        """
        logging.info('Assignment: {}'.format(topic_partitions_with_offset))
        self.consumer.assign(topic_partitions_with_offset)

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
            logging.info(msg)
            if msg is None:
                continue
            if msg.error():
                logging.info(msg.error())
                self.manage_error(msg, error_count=self.error_count)
            else:
                # Proper message
                if self.first_event is None:
                    self.first_event = datetime.now()
                self.event_count += 1
                self.error_count = 0  # Reset error count if success
                logging.info(msg.value())
                logging.info(msg.topic())
                self.process_event(msg)

    def run_consumer(self):
        """
        Create consumer, assign topics, consume and process events
        :return:
        """
        self.assign_topics(self.create_topic_partitions())
        try:
            self.consume_event()
        except (KafkaException, KafkaError):
            raise
        finally:
            # Close down consumer to commit final offsets.
            self._print_stats()
            self.consumer.close()
