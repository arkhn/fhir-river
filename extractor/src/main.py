#!/usr/bin/env python

import os
import json

from uwsgidecorators import thread, postfork
from confluent_kafka import KafkaException, KafkaError
from flask import Flask, request, jsonify, Response

from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from analyzer.src.analyze import Analyzer
from analyzer.src.analyze.graphql import PyrogClient

from extractor.src.extract import Extractor
from extractor.src.config.logger import get_logger
from extractor.src.errors import MissingInformationError
from extractor.src.producer_class import ExtractorProducer
from extractor.src.consumer_class import ExtractorConsumer
from extractor.src.errors import BadRequestError


logger = get_logger()

CONSUMER_GROUP_ID = "extractor"
EXTRACT_TOPIC = "extract"
BATCH_SIZE_TOPIC = "batch_size"
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
            event["record"] = record

            producer.produce_event(topic=EXTRACT_TOPIC, event=event)

    def process_event(msg):
        msg_value = json.loads(msg.value())
        resource_id = msg_value.get("resource_id", None)
        primary_key_values = msg_value.get("primary_key_values", None)
        batch_id = msg_value.get("batch_id", None)

        msg_topic = msg.topic()

        logger.info(
            f"Event ready to be processed (topic: {msg_topic}, message: {msg_value})",
            extra={"resource_id": resource_id},
        )

        try:
            resource_mapping, analysis, df = extract_resource(resource_id, primary_key_values)
            batch_size = extractor.batch_size(analysis, resource_mapping)
            logger.info(f"Batch size is {batch_size}", extra={"resource_id": resource_id})
            producer.produce_event(
                topic=BATCH_SIZE_TOPIC, event={"batch_id": batch_id, "size": batch_size},
            )
            broadcast_events(resource_mapping, df, analysis, batch_id)

        except Exception as err:
            logger.error(err, extra={"resource_id": resource_id})

    return process_event


def manage_kafka_error(msg):
    """
    Deal with the error if any
    :param msg:
    :return:
    """
    logger.error(msg.error())


def extract_resource(resource_id, primary_key_values):
    logger.info(f"Getting Mapping for resource {resource_id}", extra={"resource_id": resource_id})
    resource_mapping = pyrog_client.get_resource_from_id(resource_id=resource_id)

    # Get credentials
    if not resource_mapping["source"]["credential"]:
        raise MissingInformationError("credential is required to run fhir-river by batch.")

    credentials = resource_mapping["source"]["credential"]
    extractor.update_connection(credentials)

    logger.info("Analyzing Mapping", extra={"resource_id": resource_id})
    analysis = analyzer.analyze(resource_mapping)

    logger.info("Extracting rows", extra={"resource_id": resource_id})
    df = extractor.extract(resource_mapping, analysis, primary_key_values)

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
            rows.append(record)

        return jsonify({"rows": rows})

    except Exception as err:
        logger.error(err)
        raise err


@app.route("/metrics")
def metrics():
    """
    Flask endpoint to gather the metrics, will be called by Prometheus.
    """
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)


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
