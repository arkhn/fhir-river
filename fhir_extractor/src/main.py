#!/usr/bin/env python

import os
import json
from confluent_kafka import KafkaException, KafkaError
from sqlalchemy import create_engine

from fhir_extractor.src.extract import Extractor
from fhir_extractor.src.analyze import Analyzer

from fhir_extractor.src.analyze.graphql import get_resource_from_id
from fhir_extractor.src.config.logger import create_logger
from fhir_extractor.src.config.database_config import get_db_url
from fhir_extractor.src.errors import MissingInformationError
from fhir_extractor.src.helper import get_topic_name
from fhir_extractor.src.producer_class import ExtractorProducer
from fhir_extractor.src.consumer_class import ExtractorConsumer

logger = create_logger("fhir_extractor")

db_engine = create_engine(get_db_url())
analyzer = Analyzer()
extractor = Extractor(engine=db_engine)
producer = ExtractorProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))


def process_event(msg):
    msg_value = json.loads(msg.value())
    resource_id = msg_value.get("resource_id", None)
    primary_key_values = msg_value.get("primary_key_values", None)
    batch_id = msg_value.get("batch_id", None)

    msg_topic = msg.topic()

    logger.info("Events Ready to be processed")
    logger.info(msg_topic)
    logger.info(msg_value)

    try:
        logger.debug("Getting Mapping")
        resource_mapping = get_resource_from_id(resource_id=resource_id)

        # Get credentials
        if not resource_mapping["source"]["credential"]:
            raise MissingInformationError("credential is required to run fhir-river by batch.")

        credentials = resource_mapping["source"]["credential"]
        extractor.update_connection(credentials)

        analysis = analyzer.analyze(resource_mapping)
        run_resource(resource_mapping, analysis, primary_key_values, batch_id)

    except Exception as err:
        logger.error(err)

    return "Success", 200


def run_resource(resource_mapping, analysis, primary_key_values=None, batch_id=None):
    """
    """
    resource_type = resource_mapping["definitionId"]
    resource_id = resource_mapping["id"]

    # Extract
    df = extractor.extract(resource_mapping, analysis, primary_key_values)
    if df.empty:
        raise ValueError(
            "The sql query returned nothing. Maybe the primary key values "
            "you provided are not present in the database or the mapping "
            "is erroneous."
        )

    list_records_from_db = extractor.split_dataframe(df, analysis)

    for record in list_records_from_db:
        logger.debug("One record from extract")
        event = dict()
        event["batch_id"] = batch_id
        event["resource_type"] = resource_type
        event["resource_id"] = resource_id
        event["dataframe"] = record.to_dict(orient="list")

        topic = get_topic_name("mimic", resource_type, "extract")
        producer.produce_event(topic=topic, event=event)


def manage_kafka_error(msg):
    """
    Deal with the error if any
    :param msg:
    :return:
    """
    logger.error(msg.error())


if __name__ == "__main__":
    logger.info("Running Consumer")

    MAX_ERROR_COUNT = 3
    TOPIC = "extractor_trigger"
    # [get_topic_name(source="mimic", resource="Patient", task_type="extract")]
    GROUP_ID = "arkhn_extractor"

    consumer = ExtractorConsumer(
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
