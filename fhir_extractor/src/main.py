#!/usr/bin/env python

import os
import json
from confluent_kafka import KafkaException, KafkaError
from sqlalchemy import create_engine

from fhir_extractor.src.extract import Extractor
from fhir_extractor.src.analyze import Analyzer

from fhir_extractor.src.analyze.graphql import get_resource_from_id
from fhir_extractor.src.config.logger import create_logger
from fhir_extractor.src.config.database_config import DatabaseConfig, get_db_url
from fhir_extractor.src.errors import OperationOutcome
from fhir_extractor.src.helper import get_topic_name
from fhir_extractor.src.producer_class import ExtractorProducer
from fhir_extractor.src.consumer_class import ExtractorConsumer

logger = create_logger("fhir_extractor")

db_engine = create_engine(get_db_url())
analyzer = Analyzer()
extractor = Extractor(engine=db_engine)
producer = ExtractorProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))


def process_event(msg):
    """

    :return:
    """
    msg_value = json.loads(msg.value())
    resource_id = msg_value.get('resource_id', None)
    primary_key_values = msg_value.get('primaryKeyValues', None)
    batch_id = msg_value.get('batch_id', None)

    msg_topic = msg.topic()

    logger.info('Events Ready to be processed')
    logger.info(msg_topic)
    logger.info(msg_value)

    try:
        resource_mapping = get_resource_from_id(resource_id=resource_id)
        analysis = analyzer.analyze(resource_mapping)
        run_resource(resource_mapping, analysis, primary_key_values, batch_id)

        return "Success", 200

    except Exception as e:
        raise OperationOutcome(e)


def run_resource(resource_mapping, analysis, primary_key_values=None, batch_id=None):
    """
    """
    resource_type = resource_mapping["definitionId"]

    # Extract
    df = extractor.extract(resource_mapping, analysis, primary_key_values)
    if df.empty:
        raise ValueError(
            "The sql query returned nothing. Maybe the primary key values "
            "you provided are not present in the database or the mapping "
            "is erroneous."
        )

    list_records_from_db = extractor.convert_df_to_list_records(df, analysis)

    # serialize important part of the analysis for the Transformer
    serialized_analysis = serialize_analysis(analysis, resource_mapping)

    for record in list_records_from_db:
        event = {}
        event["batch_id"] = batch_id
        event["resource_type"] = resource_type
        event["record"] = record
        event["analysis"] = serialized_analysis

        topic = get_topic_name("mimic", resource_type, "extract")
        producer.produce_event(topic=topic, event=event)


def serialize_analysis(analysis, resource_mapping):
    """
    Just a convenient helper function for now.
    It shouldn't be used after the POC.
    """
    # TODO it's pretty gross to serialize and deserialize like this by hand
    serialized_analysis = {}
    serialized_analysis["attributes"] = [
        (attr.path, attr.static_inputs) for attr in analysis.attributes
    ]
    serialized_analysis["source_id"] = resource_mapping["source"]["id"]
    serialized_analysis["resource_id"] = resource_mapping["id"]
    serialized_analysis["definition"] = {
        "type": resource_mapping["definition"]["type"],
        "kind": resource_mapping["definition"]["kind"],
        "derivation": resource_mapping["definition"]["derivation"],
        "url": resource_mapping["definition"]["url"],
    }
    return serialized_analysis


def manage_kafka_error(msg):
    """
    Deal with the error if nany
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
