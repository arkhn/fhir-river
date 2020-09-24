#!/usr/bin/env python

import json
import os
import pydantic
from typings import Dict

from confluent_kafka import KafkaException, KafkaError
from fhir.resources import construct_fhir_element
from flask import Flask, request, jsonify, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from uwsgidecorators import thread, postfork

from analyzer.src.analyze import Analyzer
from analyzer.src.analyze.graphql import PyrogClient
from transformer.src.config.service_logger import logger
from transformer.src.transform import Transformer
from transformer.src.consumer_class import TransformerConsumer
from transformer.src.producer_class import TransformerProducer
from transformer.src.errors import OperationOutcome


CONSUMED_BATCH_TOPIC = "batch"
CONSUMED_EXTRACT_TOPIC = "extract"
PRODUCED_TOPIC = "transform"
CONSUMER_GROUP_ID = "transformer"

# analyzers is a map of Analyzer indexed by batch_id
analyzers: Dict[str, Analyzer] = {}
# users_tokens is a map of {auth_token: str, id_token: str} indexed by batch_id
users_tokens: Dict[str, Dict[str, str]] = {}
transformer = Transformer()


def create_app():
    app = Flask(__name__)
    return app


app = create_app()


def process_batch_event(msg):
    msg_value = json.loads(msg.value())
    batch_id = msg_value.get("batch_id")

    tokens = users_tokens.get(batch_id)
    if batch_id not in users_tokens:
        logger.info(f"Caching tokens for batch {batch_id}")
        auth_header = msg_value.get("auth_header", None)
        id_token = msg_value.get("id_token", None)
        tokens[batch_id] = {"auth_header": auth_header, "id_token": id_token}


def process_event_with_producer(producer):
    def process_event(msg):
        """ Process the event """
        msg_value = json.loads(msg.value())
        logger.debug(msg_value)
        record = msg_value.get("record")
        batch_id = msg_value.get("batch_id")
        resource_id = msg_value.get("resource_id")

        analyzer = analyzers.get(batch_id)
        if not analyzer:
            tokens = users_tokens.get("batch_id")
            if not tokens:
                logger.error(f"Tokens not found for batch {batch_id}, aborting")
                return
            pyrog_client = PyrogClient(tokens["auth_header"], tokens["id_token"])
            analyzer = Analyzer(pyrog_client)
            analyzers[batch_id] = analyzer
        analysis = analyzer.get_analysis(resource_id)
        try:
            fhir_document = transform_row(analysis, record)
            producer.produce_event(
                topic=PRODUCED_TOPIC,
                record={
                    "fhir_object": fhir_document,
                    "batch_id": batch_id,
                    "resource_id": resource_id,
                },
            )

        except Exception as err:
            logger.error(err)

    return process_event


def manage_kafka_error(msg):
    """ Deal with the error if any """
    logger.error(msg.error().str())


def transform_row(analysis, row):
    primary_key_value = row[analysis.primary_key_column.dataframe_column_name()][0]
    logging_extras = {"resource_id": analysis.resource_id, "primary_key_value": primary_key_value}

    try:
        logger.debug("Transform dataframe", extra=logging_extras)
        data = transformer.transform_data(row, analysis)

        logger.debug("Create FHIR Doc", extra=logging_extras)
        fhir_document = transformer.create_fhir_document(data, analysis)

        return fhir_document

    except Exception as e:
        logger.error(
            f"Failed to transform {row}:\n{e}",
            extra={"resource_id": analysis.resource_id, "primary_key_value": primary_key_value},
        )


@app.route("/transform", methods=["POST"])
def transform():
    body = request.get_json()
    resource_id = body.get("resource_id")
    rows = body.get("dataframe")

    # Get headers
    authorization_header = request.headers.get("Authorization")
    id_token = request.headers.get("IdToken")

    logger.info(
        f"POST /transform. Transforming {len(rows)} row(s).", extra={"resource_id": resource_id}
    )
    pyrog_client = PyrogClient(authorization_header, id_token)
    analysis = Analyzer(pyrog_client).get_analysis(resource_id)
    try:
        fhir_instances = []
        errors = []
        for row in rows:
            fhir_document = transform_row(analysis, row)
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
def run_extract_consumer():
    logger.info("Running transform consumer")

    producer = TransformerProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))
    consumer = TransformerConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        topics=CONSUMED_EXTRACT_TOPIC,
        group_id=CONSUMER_GROUP_ID,
        process_event=process_event_with_producer(producer),
        manage_error=manage_kafka_error,
    )

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logger.error(err)


@postfork
@thread
def run_batch_consumer():
    logger.info("Running batch consumer")

    consumer = TransformerConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        topics=CONSUMED_BATCH_TOPIC,
        group_id=CONSUMER_GROUP_ID,
        process_event=process_batch_event,
        manage_error=manage_kafka_error,
    )

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logger.error(err)
