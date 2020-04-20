#!/usr/bin/env python

import os
import json
from uwsgidecorators import thread, postfork
from confluent_kafka import KafkaException, KafkaError
from sqlalchemy import create_engine
from flask import Flask, request, jsonify

from fhir_extractor.src.extract import Extractor
from fhir_extractor.src.analyze import Analyzer

from fhir_extractor.src.analyze.graphql import get_resource_from_id
from fhir_extractor.src.config.logger import create_logger
from fhir_extractor.src.errors import MissingInformationError
from fhir_extractor.src.helper import get_topic_name
from fhir_extractor.src.producer_class import ExtractorProducer
from fhir_extractor.src.consumer_class import ExtractorConsumer

logger = create_logger("fhir_extractor")

analyzer = Analyzer()
extractor = Extractor()
producer = ExtractorProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))


def create_app():
    app = Flask(__name__)
    return app


app = create_app()


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
        df = extractor.extract(resource_mapping, analysis, primary_key_values)
        if df.empty:
            raise ValueError(
                "The sql query returned nothing. Maybe the primary key values "
                "you provided are not present in the database or the mapping "
                "is erroneous."
            )
        broadcast_events(resource_mapping, df, analysis, batch_id)

    except Exception as err:
        logger.error(err)


def broadcast_events(resource_mapping, dataframe, analysis, batch_id=None):
    """
    """
    resource_type = resource_mapping["definitionId"]
    resource_id = resource_mapping["id"]
    list_records_from_db = extractor.split_dataframe(dataframe, analysis)

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


@app.route("/extract", methods=["POST"])
def extract():
    body = request.get_json()
    resource_id = body.get("resource_id", None)
    primary_key_values = body.get("primary_key_values", None)
    resource_mapping = get_resource_from_id(resource_id)

    try:
        logger.debug("Getting Mapping")
        resource_mapping = get_resource_from_id(resource_id=resource_id)
        analysis = analyzer.analyze(resource_mapping)
        df = extractor.extract(resource_mapping, analysis, primary_key_values)
        if df.empty:
            raise OperationOutcome(
                "The sql query returned nothing. Maybe the primary key values "
                "you provided are not present in the database or the mapping "
                "is erroneous."
            )

        rows = []
        for record in extractor.split_dataframe(df, analysis):
            logger.debug("One record from extract")
            rows.append(record.to_dict(orient="list"))

        return jsonify({"rows": rows})

    except Exception as err:
        logger.error(err)
        raise OperationOutcome(err)


@app.errorhandler(OperationOutcome)
def handle_bad_request(e):
    return str(e), 400


# these decorators tell uWSGI (the server with which the app is run)
# to spawn a new thread every time a worker starts. Hence the consumer
# is started at the same time as the Flask API.
@postfork
@thread
def run_consumer():
    logger.info("Running Consumer")

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
