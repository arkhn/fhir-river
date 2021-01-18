#!/usr/bin/env python

import json
import os
import pydantic

from confluent_kafka import KafkaException, KafkaError
from fhir.resources import construct_fhir_element
from flask import Flask, g, request, jsonify, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
import redis
from uwsgidecorators import thread, postfork

from analyzer.src.analyze import Analyzer
from analyzer.src.errors import AuthenticationError, AuthorizationError
from logger import format_traceback
from transformer.src.config.service_logger import logger
from transformer.src.transform import Transformer
from transformer.src.consumer_class import TransformerConsumer
from transformer.src.producer_class import TransformerProducer
from transformer.src.errors import OperationOutcome

# FIXME there are 2 OperationOutcome: 1 in tranformer and 1 in analyzer

REDIS_MAPPINGS_HOST = os.getenv("REDIS_MAPPINGS_HOST")
REDIS_MAPPINGS_PORT = os.getenv("REDIS_MAPPINGS_PORT")
REDIS_MAPPINGS_DB = os.getenv("REDIS_MAPPINGS_DB")
ENV = os.getenv("ENV")
IN_PROD = ENV != "test"

transformer = Transformer()


def transform_row(analysis, row):
    primary_key_value = row[analysis.primary_key_column.dataframe_column_name()]
    logging_extras = {
        "resource_id": analysis.resource_id,
        "primary_key_value": primary_key_value,
    }

    try:
        logger.debug("Transform dataframe", extra=logging_extras)
        data = transformer.transform_data(row, analysis)

        logger.debug("Create FHIR Doc", extra=logging_extras)
        fhir_document = transformer.create_fhir_document(data, analysis)

        return fhir_document

    except Exception as e:
        logger.error(
            format_traceback(),
            extra={
                "resource_id": analysis.resource_id,
                "primary_key_value": primary_key_value,
            },
        )
        raise OperationOutcome(f"Failed to transform {row}:\n{e}") from e


def get_redis_client():
    if "redis_client" not in g:
        g.redis_client = redis.Redis(
            host=REDIS_MAPPINGS_HOST, port=REDIS_MAPPINGS_PORT, db=REDIS_MAPPINGS_DB
        )
    return g.redis_client


#############
# FLASK API #
#############


def create_app():
    app = Flask(__name__)

    # load redis client
    with app.app_context():
        get_redis_client()

    return app


app = create_app()


@app.route("/transform", methods=["POST"])
def transform():
    body = request.get_json()
    resource_id = body.get("resource_id")
    preview_id = body.get("preview_id")
    rows = body.get("dataframe")

    logger.info(
        f"POST /transform. Transforming {len(rows)} row(s).",
        extra={"resource_id": resource_id},
    )
    analysis = Analyzer(redis_client=get_redis_client()).load_cached_analysis(
        preview_id, resource_id
    )
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

    except OperationOutcome:
        raise
    except Exception as err:
        logger.error(format_traceback())
        raise OperationOutcome(err)


@app.route("/metrics")
def metrics():
    """
    Flask endpoint to gather the metrics, will be called by Prometheus.
    """
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

CONSUMED_TOPICS = "^extract\\..*"
CONSUMER_GROUP_ID = "transformer"
PRODUCED_TOPIC_PREFIX = "transform."


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
        topics=CONSUMED_TOPICS,
        group_id=CONSUMER_GROUP_ID,
        process_event=process_event_with_context(producer),
        manage_error=manage_kafka_error,
    )

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError):
        logger.error(format_traceback())


def process_event_with_context(producer):
    with app.app_context():
        redis_client = get_redis_client()
    analyzer = Analyzer(redis_client=redis_client)

    def process_event(msg):
        """ Process the event """
        msg_value = json.loads(msg.value())
        logger.debug(msg.value())
        record = msg_value.get("record")
        batch_id = msg_value.get("batch_id")
        resource_id = msg_value.get("resource_id")

        try:
            analysis = analyzer.load_cached_analysis(batch_id, resource_id)

            fhir_document = transform_row(analysis, record)
            producer.produce_event(
                topic=f"{PRODUCED_TOPIC_PREFIX}{batch_id}",
                record={
                    "fhir_object": fhir_document,
                    "batch_id": batch_id,
                    "resource_id": resource_id,
                },
            )
        except OperationOutcome:
            pass
        except Exception:
            logger.error(format_traceback())

    return process_event


def manage_kafka_error(msg):
    """ Deal with the error if any """
    logger.error(msg.error().str())
