#!/usr/bin/env python

import json
import os
from uwsgidecorators import thread, postfork
from confluent_kafka import KafkaException, KafkaError
from flask import Flask, request, jsonify
from jsonschema.exceptions import ValidationError

from fhir_transformer.src.analyze import Analyzer
from fhir_transformer.src.transform import Transformer

from fhir_transformer.src.consumer_class import TransformerConsumer
from fhir_transformer.src.producer_class import TransformerProducer

from fhir_transformer.src.config.logger import create_logger
from fhir_transformer.src.helper import get_topic_name
from fhir_transformer.src.errors import OperationOutcome
from fhir_transformer.src.fhirstore import get_fhirstore

TOPIC = [get_topic_name(source="mimic", resource="Patient", task_type="extract")]
GROUP_ID = "arkhn_transformer"
producer = TransformerProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))

logger = create_logger("consumer")

analyzer = Analyzer()
transformer = Transformer()

fhirstore = get_fhirstore()


def create_app():
    app = Flask(__name__)
    return app


app = create_app()


def process_event(msg):
    """
    Process the event
    :param msg:
    :return:
    """
    # Do stuff
    msg_value = json.loads(msg.value())
    logger.debug("Transformer")
    logger.debug(msg_value)

    try:
        fhir_document = transform_row(msg_value["resource_id"], msg_value["dataframe"])
        topic = get_topic_name(
            source="mimic", resource=msg_value["resource_type"], task_type="transform"
        )
        producer.produce_event(topic=topic, record=fhir_document)

    except Exception as err:
        logger.error(err)


def manage_kafka_error(msg):
    """
    Deal with the error if nany
    :param msg:
    :return:
    """
    logger.error(msg.error())


def transform_row(resource_id, row):
    logger.debug("Get Analysis")
    analysis = analyzer.get_analysis(resource_id)

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
            fhir_document = transform_row(resource_id, row)
            fhir_instances.append(fhir_document)
            try:
                fhirstore.validate(fhir_document)
            except ValidationError as e:
                errors.append(str(e))

        return jsonify({"instances": fhir_instances, "errors": errors})

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

    consumer = TransformerConsumer(
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
