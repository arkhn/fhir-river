#!/usr/bin/env python

import sys
from confluent_kafka import KafkaException, KafkaError
from fhir_consumer.src.consumer_class import POETAConsumer
from fhir_consumer.src.logger import create_logger

MAX_ERROR_COUNT = 3
TOPIC = 'test'
GROUP_ID = 'test'

logging = create_logger('consumer')


def process_events(msg):
    """
    Process the event
    :param msg:
    :return:
    """
    logging.info(msg.value())
    logging.info(msg.topic())


def manage_kafka_error(msg, error_count):
    """
    Deal with error.
    If Error code == _TRANSPORT, then increment error_count by 1. When it reaches 3, then raise an error.
    If error code ==  _PARTITION_EOF, ie no more message, then do nothing
    Else, raise an Exception
    :param msg:
    :param error_count:
    :return:
    """
    # Error due to failed connection to kafka broker
    if msg.error() == KafkaError._TRANSPORT:
        logging.error(msg.error())
        error_count += 1
        # After 3 exceptions, we raise an Error and make it crash to avoid being stuck in a
        # unconnected loop.
        if error_count == MAX_ERROR_COUNT:
            raise KafkaException(msg.error())

    # No more message Error does not raise Exception. Other Exceptions do.
    if not msg.error() in [KafkaError._PARTITION_EOF, KafkaError._TRANSPORT]:
        logging.error(msg.error())
        raise KafkaException(msg.error())


if __name__ == '__main__':
    logging.info("RUN CONSUMER")
    argv = sys.argv[1:]
    if len(argv) < 2:
        raise IndexError("Missing broker or registry")

    consumer = POETAConsumer(broker=argv[0],
                             registry=argv[1],
                             topics=TOPIC,
                             group_id=GROUP_ID,
                             process_event=process_events,
                             manage_error=manage_kafka_error)

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logging.error(err)
