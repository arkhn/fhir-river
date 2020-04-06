#!/usr/bin/env python

import os
from confluent_kafka import KafkaException, KafkaError
from fhir_consumer.src.consumer_class import FhirConsumer
from fhir_consumer.src.logger import create_logger

MAX_ERROR_COUNT = 3
TOPIC = ['mimic-patients',
         'mimic-admissions',
         'sftp-ambroise-pare']
GROUP_ID = 'arkhn'

logging = create_logger('consumer')


def process_event(msg):
    """
    Process the event
    :param msg:
    :return:
    """
    logging.info(msg.topic())
    logging.info(msg.value())
    # Do stuff


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
    consumer = FhirConsumer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
                            topics=TOPIC,
                            group_id=GROUP_ID,
                            process_event=process_event,
                            manage_error=manage_kafka_error)

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logging.error(err)
