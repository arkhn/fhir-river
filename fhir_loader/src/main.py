#!/usr/bin/env python

import os
import json
import datetime
from confluent_kafka import KafkaException, KafkaError
from fhir_loader.src.consumer_class import LoaderConsumer
from fhir_loader.src.config.logger import create_logger
from fhir_loader.src.helper import get_topic_name

MAX_ERROR_COUNT = 3
TOPIC = [get_topic_name(source='mimic', resource='patients', task_type='transform')]
GROUP_ID = 'arkhn_loader'

logging = create_logger('loader')


def process_event(msg):
    """
    Process the event
    :param msg:
    :return:
    """
    msg_value = json.loads(msg.value())
    msg_topic = msg.topic()
    logging.info("Loader")
    logging.info(msg_topic)
    logging.info(msg_value)
    # Load stuff


def manage_kafka_error(msg):
    """
    Deal with the error if nany
    :param msg:
    :return:
    """
    logging.error(msg.error())
    pass


if __name__ == '__main__':
    logging.info("Running Consumer")
    consumer = LoaderConsumer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
                              topics=TOPIC,
                              group_id=GROUP_ID,
                              process_event=process_event,
                              manage_error=manage_kafka_error)

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logging.error(err)
