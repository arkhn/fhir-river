#!/usr/bin/env python

from confluent_kafka import KafkaException, KafkaError
import json
import os
from pymongo.errors import DuplicateKeyError

from fhirstore import NotFoundError

from loader.src.config.logger import create_logger
from loader.src.consumer_class import LoaderConsumer
from loader.src.load import Loader
from loader.src.load.fhirstore import get_fhirstore


TOPIC = "transform"
GROUP_ID = "arkhn_loader"

logger = create_logger("loader")


def override_document(fhir_instance):
    try:
        # TODO add a wrapper method in fhirstore to delete as follows?
        fhirstore.db[fhir_instance["resourceType"]].delete_one(
            {"identifier": fhir_instance["identifier"]}
        )
    except NotFoundError as e:
        logger.warning(f"error while trying to delete previous documents: {e}")


def process_event(msg):
    """
    Process the event
    :param msg:
    :return:
    """
    fhir_instance = json.loads(msg.value())
    msg_topic = msg.topic()
    logger.debug("Loader")
    logger.debug(fhir_instance)

    # TODO how will we handle override in fhir-river?
    if True:  # should be "if override:" or something like that
        override_document(fhir_instance)

    try:
        loader.load(fhirstore, fhir_instance)
    except DuplicateKeyError as e:
        logger.error(e)


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
    loader = Loader(fhirstore, bypass_validation=False)
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
