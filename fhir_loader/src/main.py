#!/usr/bin/env python

import datetime
import json
import os

from confluent_kafka import KafkaException, KafkaError

from fhir_loader.src.config.logger import create_logger
from fhir_loader.src.consumer_class import LoaderConsumer
from fhir_loader.src.helper import get_topic_name
from fhir_loader.src.load import Loader
from fhir_loader.src.load.fhirstore import get_fhirstore


MAX_ERROR_COUNT = 3
TOPIC = [get_topic_name(source="mimic", resource="Patient", task_type="transform")]
GROUP_ID = "arkhn_loader"

logger = create_logger("loader")


def process_event(msg):
    """
    Process the event
    :param msg:
    :return:
    """
    msg_value = json.loads(msg.value())
    msg_topic = msg.topic()
    logger.info("Loader")
    logger.info(msg_topic)
    logger.info(msg_value)

    # Load stuff
    loader.load(fhirstore, msg_value)


def manage_kafka_error(msg):
    """
    Deal with the error if nany
    :param msg:
    :return:
    """
    logger.error(msg.error())


if __name__ == "__main__":
    logger.info("Running Consumer")

    fhirstore = get_fhirstore()

    # TODO how will we handle bypass_validation in fhir-river?
    loader = Loader(fhirstore, bypass_validation=True)
    consumer = LoaderConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        topics=TOPIC,
        group_id=GROUP_ID,
        process_event=process_event,
        manage_error=manage_kafka_error,
    )

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logger.error(err)
