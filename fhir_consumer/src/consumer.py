#!/usr/bin/env python

import sys
from confluent_kafka import KafkaException, KafkaError
from fhir_consumer.src.consumer_class import Consumer
from fhir_consumer.src.logger import create_logger

MAX_ERROR_COUNT = 3
TOPIC = 'test'
GROUP_ID = 'test'

logging = create_logger('consumer')


def process_event(msg):
    """
    Process the event
    :param msg:
    :return:
    """
    logging.info(msg.value())
    logging.info(msg.topic())


def manage_kafka_error(msg):
    """
    :param msg:
    :return:
    """
    logging.error(msg.error())
    pass


if __name__ == '__main__':
    logging.info("RUN CONSUMER")
    argv = sys.argv[1:]
    if len(argv) < 2:
        raise IndexError("Missing broker or registry")

    consumer = Consumer(broker=argv[0],
                        registry=argv[1],
                        topics=TOPIC,
                        group_id=GROUP_ID,
                        process_event=process_event,
                        manage_error=manage_kafka_error)

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logging.error(err)
