#!/usr/bin/env python

from confluent_kafka import KafkaException, KafkaError
import datetime
import json
import os
from pymongo.errors import DuplicateKeyError

from fhirstore import NotFoundError

from fhir_loader.src.config.logger import create_logger
from fhir_loader.src.consumer_class import LoaderConsumer
from fhir_loader.src.helper import get_topic_name
from fhir_loader.src.load import Loader
from fhir_loader.src.load.fhirstore import get_fhirstore


MAX_ERROR_COUNT = 3
TOPIC = [get_topic_name(source="mimic", resource="Patient", task_type="transform")]
GROUP_ID = "arkhn_loader"

logger = create_logger("loader")


def override_resource(fhir_instance):
    # TODO here we delete all the documents for the resource even if we only want
    # to add a single document. This is not the behavior expected in fhir-river.
    try:
        intance_tags = fhir_instance["meta"]["tag"]
        resource_id = None
        for tag in intance_tags:
            if tag["system"] == "http://terminology.arkhn.org/CodeSystem/resource":
                resource_id = tag["code"]
                break
        if resource_id is not None:
            fhirstore.delete(fhir_instance["resourceType"], resource_id=resource_id)
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
    logger.info("Loader")
    logger.info(msg_topic)

    # TODO how will we handle override in fhir-river?
    if True:  # should be if override:
        override_resource(fhir_instance)

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
