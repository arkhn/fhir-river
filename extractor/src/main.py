#!/usr/bin/env python

import os
import json
import sys
import traceback
from typing import Dict

from confluent_kafka import KafkaException, KafkaError
from flask import Flask, request, jsonify, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from uwsgidecorators import thread, postfork

from analyzer.src.analyze import Analyzer
from analyzer.src.analyze.graphql import PyrogClient
from analyzer.src.errors import AuthenticationError, AuthorizationError
from extractor.src.config.service_logger import logger
from extractor.src.consumer_class import ExtractorConsumer
from extractor.src.errors import BadRequestError, MissingInformationError
from extractor.src.extract import Extractor
from extractor.src.json_encoder import MyJSONEncoder
from extractor.src.producer_class import ExtractorProducer

ENV = os.getenv("ENV")
IN_PROD = ENV != "test"

# analyzers is a map of Analyzer indexed by batch_id
analyzers: Dict[str, Analyzer] = {}
extractor = Extractor()


def extract_resource(analysis, primary_key_values):
    if not analysis.source_credentials:
        raise MissingInformationError("credential is required to run fhir-river.")

    credentials = analysis.source_credentials
    extractor.update_connection(credentials)

    logger.info("Extracting rows", extra={"resource_id": analysis.resource_id})
    df = extractor.extract(analysis, primary_key_values)

    return df


#############
# FLASK API #
#############


def create_app():
    app = Flask(__name__)
    return app


app = create_app()
# Override default JSONEncoder
app.json_encoder = MyJSONEncoder


@app.route("/extract", methods=["POST"])
def extract():
    authorization_header = request.headers.get("Authorization")
    body = request.get_json()
    resource_id = body.get("resource_id", None)
    primary_key_values = body.get("primary_key_values", None)

    logger.info(
        f"Extract from API with primary key value {primary_key_values}",
        extra={"resource_id": resource_id},
    )

    if not primary_key_values:
        raise BadRequestError("primary_key_values is required in request body")

    try:
        pyrog_client = PyrogClient(authorization_header)
        analyzer = Analyzer(pyrog_client)
        analysis = analyzer.fetch_analysis(resource_id)
        df = extract_resource(analysis, primary_key_values)
        rows = []
        for record in extractor.split_dataframe(df, analysis):
            logger.debug("One record from extract", extra={"resource_id": resource_id})
            rows.append(record)

        return jsonify({"rows": rows})

    except Exception as err:
        logger.error("".join(traceback.format_exception(*sys.exc_info())))
        raise err


@app.route("/fetch-analysis", methods=["POST"])
def fetch_analysis():
    body = request.get_json()
    resource_ids = body.get("resource_ids", None)
    batch_id = body.get("batch_id", None)
    authorization_header = request.headers.get("Authorization")

    logger.info(f"Fetch analysis for batch {batch_id}")

    if not authorization_header and IN_PROD:
        raise AuthenticationError(f"authorization header not found for batch {batch_id}, aborting")

    pyrog_client = PyrogClient(authorization_header)
    analyzer = Analyzer(pyrog_client)
    for resource_id in resource_ids:
        analyzer.fetch_analysis(resource_id)
    analyzers[batch_id] = analyzer


@app.route("/metrics")
def metrics():
    """ Flask endpoint to gather the metrics, will be called by Prometheus. """
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)


@app.errorhandler(Exception)
def handle_operation_outcome(e):
    return jsonify({"error": str(e)}), 400


@app.errorhandler(AuthenticationError)
def handle_authentication_error(e):
    return jsonify({"error": str(e)}), 401


@app.errorhandler(AuthorizationError)
def handle_authorization_error(e):
    return jsonify({"error": str(e)}), 403


################
# KAFKA CLIENT #
################

CONSUMER_GROUP_ID = "extractor"
EXTRACT_TOPIC = "extract"
BATCH_SIZE_TOPIC = "batch_size"
CONSUMED_TOPIC = "batch"


# these decorators tell uWSGI (the server with which the app is run)
# to spawn a new thread every time a worker starts. Hence the consumer
# is started at the same time as the Flask API.
@postfork
@thread
def run_consumer():
    logger.info("Running extract consumer")

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


def process_event_with_producer(producer):
    def broadcast_events(dataframe, analysis, batch_id=None):
        resource_type = analysis.definition_id
        resource_id = analysis.resource_id
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
            f"Event ready to be processed (topic: {msg_topic})", extra={"resource_id": resource_id},
        )

        try:
            if batch_id not in analyzers:
                logger.error(f"Analyzer not found for batch {batch_id}, aborting")
                return
            analysis = analyzers[batch_id].get_analysis(resource_id)
            if not analysis:
                logger.error(
                    f"Analysis not found for batch {batch_id} and resource {resource_id}, aborting"
                )
                return

            df = extract_resource(analysis, primary_key_values)
            batch_size = extractor.batch_size(analysis)
            logger.info(
                f"Batch size is {batch_size} for resource type {analysis.definition_id}",
                extra={"resource_id": resource_id},
            )
            producer.produce_event(
                topic=BATCH_SIZE_TOPIC, event={"batch_id": batch_id, "size": batch_size},
            )
            broadcast_events(df, analysis, batch_id)

        except Exception as err:
            logger.error(err, extra={"resource_id": resource_id})

    return process_event


def manage_kafka_error(msg):
    """ Deal with the error if any """
    logger.error(msg.error().str())
