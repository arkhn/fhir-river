#!/usr/bin/env python

import json
import os
import pydantic

from confluent_kafka import KafkaException, KafkaError
from flask import Flask, request, jsonify, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from uwsgidecorators import thread, postfork

from fhir.resources import construct_fhir_element

from analyzer.src.analyze import Analyzer
from analyzer.src.analyze.graphql import PyrogClient
from transformer.src.transform import Transformer

from transformer.src.consumer_class import TransformerConsumer
from transformer.src.producer_class import TransformerProducer

from transformer.src.config.logger import get_logger
from transformer.src.errors import OperationOutcome


CONSUMED_TOPIC = "extract"
PRODUCED_TOPIC = "transform"
CONSUMER_GROUP_ID = "transformer"

logger = get_logger()

analyzer = Analyzer(PyrogClient())
transformer = Transformer()


def create_app():
    app = Flask(__name__)
    return app


app = create_app()


def process_event_with_producer(producer):
    def process_event(msg):
        """ Process the event """
        msg_value = json.loads(msg.value())
        logger.debug(msg_value)

        try:
            fhir_document = transform_row(msg_value["resource_id"], msg_value["record"])
            producer.produce_event(topic=PRODUCED_TOPIC, record=fhir_document)

        except Exception as err:
            logger.error(err)

    return process_event


def manage_kafka_error(msg):
    """ Deal with the error if nany """
    logger.error(msg.error())


def transform_row(resource_id, row, time_refresh_analysis=3600):
    logger.debug("Get Analysis", extra={"resource_id": resource_id})
    analysis = analyzer.get_analysis(resource_id, time_refresh_analysis)

    primary_key_value = row[analysis.primary_key_column.dataframe_column_name()][0]
    logging_extras = {"resource_id": resource_id, "primary_key_value": primary_key_value}

    try:
        logger.debug("Transform dataframe", extra=logging_extras)
        data = transformer.transform_data(row, analysis)

        logger.debug("Create FHIR Doc", extra=logging_extras)
        fhir_document = transformer.create_fhir_document(data, analysis)

        return fhir_document

    except Exception as e:
        logger.error(
            f"Failed to transform {row}:\n{e}",
            extra={"resource_id": resource_id, "primary_key_value": primary_key_value},
        )


@app.route("/transform", methods=["POST"])
def transform():
    body = request.get_json()
    resource_id = body.get("resource_id")
    rows = body.get("dataframe")
    logger.info(
        f"POST /transform. Transforming {len(rows)} row(s).", extra={"resource_id": resource_id}
    )
    try:
        fhir_instances = []
        errors = []
        for row in rows:
            fhir_document = transform_row(resource_id, row, time_refresh_analysis=0)
            fhir_instances.append(fhir_document)
            try:
                resource_type = fhir_document.get("resourceType")
                construct_fhir_element(resource_type, fhir_document)
            except pydantic.ValidationError as e:
                errors.extend(
                    [
                        f"{err['msg'] or 'Validation error'}: "
                        f"{e.model.get_resource_type()}.{'.'.join([str(l) for l in err['loc']])}"
                        for err in e.errors()
                    ]
                )

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
