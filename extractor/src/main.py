#!/usr/bin/env python

import os
import json
from uwsgidecorators import thread, postfork
from confluent_kafka import KafkaException, KafkaError
from flask import Flask, request, jsonify

from analyzer.src.analyze import Analyzer
from analyzer.src.analyze.graphql import PyrogClient

from extractor.src.extract import Extractor
from extractor.src.config.logger import create_logger
from extractor.src.errors import MissingInformationError
from extractor.src.producer_class import ExtractorProducer
from extractor.src.consumer_class import ExtractorConsumer
from extractor.src.errors import BadRequestError, EmptyResult

logger = create_logger("extractor")

CONSUMER_GROUP_ID = "extractor"
PRODUCED_TOPIC = "extract"
CONSUMED_TOPIC = "batch"

pyrog_client = PyrogClient()
analyzer = Analyzer(pyrog_client)
extractor = Extractor()


def create_app():
    app = Flask(__name__)
    return app


app = create_app()


def process_event_with_producer(producer):
    def broadcast_events(resource_mapping, dataframe, analysis, batch_id=None):
        resource_type = resource_mapping["definitionId"]
        resource_id = resource_mapping["id"]
        list_records_from_db = extractor.split_dataframe(dataframe, analysis)

        for record in list_records_from_db:
            logger.debug(
                "One record from extract", extra={"resource_id": resource_id},
            )
            event = dict()
            event["batch_id"] = batch_id
            event["resource_type"] = resource_type
            event["resource_id"] = resource_id
            event["dataframe"] = record.to_dict(orient="list")

            producer.produce_event(topic=PRODUCED_TOPIC, event=event)

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
            resource_mapping, analysis, df = extract_resource(resource_id, primary_key_values)
            broadcast_events(resource_mapping, df, analysis, batch_id)

        except Exception as err:
            logger.error(err)

    return process_event


def manage_kafka_error(msg):
    """
    Deal with the error if any
    :param msg:
    :return:
    """
    logger.error(msg.error())


def extract_resource(resource_id, primary_key_values):
    logger.debug("Getting Mapping for resource %s", resource_id, extra={"resource_id": resource_id})
    resource_mapping = pyrog_client.get_resource_from_id(resource_id=resource_id)

    # Get credentials
    if not resource_mapping["source"]["credential"]:
        raise MissingInformationError("credential is required to run fhir-river by batch.")

    credentials = resource_mapping["source"]["credential"]
    extractor.update_connection(credentials)

    logger.debug("Analyzing Mapping", extra={"resource_id": resource_id})
    analysis = analyzer.analyze(resource_mapping)

    logger.debug("Extracting rows", extra={"resource_id": resource_id})
    df = extractor.extract(resource_mapping, analysis, primary_key_values)
    if df.empty:
        raise EmptyResult(
            "The sql query returned nothing. Maybe the primary key values "
            "you provided are not present in the database or the mapping "
            "is erroneous."
        )

    return resource_mapping, analysis, df


@app.route("/extract", methods=["POST"])
def extract():
    body = request.get_json()
    resource_id = body.get("resource_id", None)
    primary_key_values = body.get("primary_key_values", None)
    if not primary_key_values:
        raise BadRequestError("primary_key_values is required in request body")

    try:
        _, analysis, df = extract_resource(resource_id, primary_key_values)
        rows = []
        for record in extractor.split_dataframe(df, analysis):
            logger.debug("One record from extract", extra={"resource_id": resource_id})
            rows.append(record.to_dict(orient="list"))

        return jsonify({"rows": rows})

    except Exception as err:
        logger.error(err)
        raise err


@app.errorhandler(Exception)
def handle_bad_request(e):
    return str(e), 400


# these decorators tell uWSGI (the server with which the app is run)
# to spawn a new thread every time a worker starts. Hence the consumer
# is started at the same time as the Flask API.
@postfork
@thread
def run_consumer():
    logger.info("Running Consumer")

    producer = ExtractorProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))
    consumer = ExtractorConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        topics=CONSUMED_TOPIC,
        group_id=CONSUMER_GROUP_ID,
        process_event=process_event_with_producer(producer),
        manage_error=manage_kafka_error,
    )

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logger.error(err)
