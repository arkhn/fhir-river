#!/usr/bin/env python

import json
import os

from confluent_kafka import KafkaException, KafkaError
from flask import Flask, request, jsonify, Response
from jsonschema.exceptions import ValidationError
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from uwsgidecorators import thread, postfork


from analyzer.src.analyze import Analyzer
from analyzer.src.analyze.graphql import PyrogClient
from transformer.src.transform import Transformer

from transformer.src.consumer_class import TransformerConsumer
from transformer.src.producer_class import TransformerProducer

from transformer.src.config.logger import create_logger
from transformer.src.errors import OperationOutcome
from transformer.src.fhirstore import get_fhirstore

CONSUMED_TOPIC = "extract"
PRODUCED_TOPIC = "transform"
CONSUMER_GROUP_ID = "transformer"

logger = create_logger("consumer")

analyzer = Analyzer(PyrogClient())
transformer = Transformer()

fhirstore = get_fhirstore()


def create_app():
    app = Flask(__name__)
    return app


app = create_app()


def process_event_with_producer(producer):
    def process_event(msg):
        """
        Process the event
        :param msg:
        :return:
        """
        msg_value = json.loads(msg.value())
        logger.debug("Transformer")
        logger.debug(msg_value)

        try:
            fhir_document = transform_row(msg_value["resource_id"], msg_value["record"])
            producer.produce_event(topic=PRODUCED_TOPIC, record=fhir_document)

        except Exception as err:
            logger.error(err)

    return process_event


def manage_kafka_error(msg):
    """
    Deal with the error if nany
    :param msg:
    :return:
    """
    logger.error(msg.error())


def transform_row(resource_id, row, time_refresh_analysis=3600):
    logger.debug("Get Analysis")
    analysis = analyzer.get_analysis(resource_id, time_refresh_analysis)

    logger.debug("Transform Df")
    data = transformer.transform_data(row, analysis)

    logger.debug("Create FHIR Doc")
    fhir_document = transformer.create_fhir_document(data, analysis)

    return fhir_document


@app.route("/transform", methods=["POST"])
def transform():
    body = request.get_json()
    logger.debug("Transformer")
    logger.debug(body)

    resource_id = body.get("resource_id")
    try:
        fhir_instances = []
        errors = []
        for row in body.get("dataframe"):
            fhir_document = transform_row(resource_id, row, time_refresh_analysis=0)
            fhir_instances.append(fhir_document)
            try:
                fhirstore.validate(fhir_document)
            except ValidationError as e:
                errors.append(str(e))

        return jsonify({"instances": fhir_instances, "errors": errors})

    except Exception as err:
        logger.error(err)
        raise OperationOutcome(err)


@app.route("/metrics")
def metrics():
    """
    Flask endpoint to gather the metrics, will be called by Prometheus.
    """
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)


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

    producer = TransformerProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))
    consumer = TransformerConsumer(
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
