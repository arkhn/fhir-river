#!/usr/bin/env python


import os
import random
from confluent_kafka.avro import AvroProducer, load
from confluent_kafka.avro.error import ClientError
from confluent_kafka.avro.serializer import SerializerError, ValueSerializerError
from fhir_consumer.src.logger import create_logger

logging = create_logger('producer')


def callback_fn(err, msg, obj):
    """
    Handle delivery reports served from producer.poll.
    This callback takes an extra argument, obj.
    This allows the original contents to be included for debugging purposes.
    """
    if err is not None:
        logging.error('Message {} delivery failed with error {} for topic {}'.format(
            obj, err, msg.topic()))
    else:
        logging.info("SUCCESS")


class Producer:

    def __init__(self,
                 broker=None,
                 registry=None,
                 callback_function=None,
                 avro_schema_path=None):
        """
        Instantiate the class and create the consumer object
        :param broker: host[:port]’ string (or list of ‘host[:port]’ strings) that the consumer should contact to
        bootstrap initial cluster metadata
        :param registry: string, avro registry url
        :param callback_function: fn taking 3 args: err, msg, obj, that is called after the event is produced
        and an error increment (int)
        """
        self.broker = broker
        self.registry = registry
        self.partition = 0
        self.callback_function = callback_function
        self.avro_schema_path = avro_schema_path

        # Create consumer
        self.producer = AvroProducer(self._generate_config(),
                                     default_value_schema=self.load_avro_schema())

    def load_avro_schema(self):
        """
        Load avro avro_schema from local
        :return:
        """
        if self.avro_schema_path:
            return load(self.avro_schema_path)
        return None

    def _generate_config(self):
        """
        Generate configuration dictionary for consumer
        :return:
        """
        config = {'bootstrap.servers': self.broker,
                  'schema.registry.url': self.registry,
                  'session.timeout.ms': 6000}
        return config

    def produce_event(self, topic, record):
        """
        Produce event in the specified topic
        :return:
        """
        try:
            self.producer.produce(topic=topic,
                                  value=record,
                                  callback=lambda err, msg, obj=record: self.callback_function(err, msg, obj))
            self.producer.poll(0)  # Callback function
            self.producer.flush(10)
        except (SerializerError, ValueSerializerError, ClientError, ValueError) as error:
            logging.error(error)


# Producer
producer = Producer(broker=os.getenv('KAFKA_BOOTSTRAP_SERVERS'),
                    registry=os.getenv('AVRO_REGISTRY_URL'),
                    callback_function=callback_fn,
                    avro_schema_path='/app/fhir_consumer/src/avro_schema/TestEvent.avsc')


def produce_test_event():
    """
    Test producer
    :return:
    """
    producer.produce_event(topic='test', record={'test_key': str(int(100 * random.random()))})


if __name__ == '__main__':
    logging.info("Producing...")
    produce_test_event()
    logging.info("Produced...")
