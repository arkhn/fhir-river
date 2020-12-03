#!/usr/bin/env python

import json
import os

from confluent_kafka import KafkaException, KafkaError
from flask import Flask, request, jsonify, Response, g
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from pymongo.errors import DuplicateKeyError
import redis
from uwsgidecorators import thread, postfork

from fhirstore import NotFoundError

from analyzer.src.analyze import Analyzer
from analyzer.src.errors import AuthenticationError, AuthorizationError
from loader.src.config.service_logger import logger
from loader.src.load import Loader
from loader.src.load.fhirstore import get_fhirstore
from loader.src.reference_binder import ReferenceBinder
from loader.src.consumer_class import LoaderConsumer
from loader.src.producer_class import LoaderProducer
from logger import format_traceback

REDIS_COUNTER_HOST = os.getenv("REDIS_COUNTER_HOST")
REDIS_COUNTER_PORT = os.getenv("REDIS_COUNTER_PORT")
REDIS_COUNTER_DB = os.getenv("REDIS_COUNTER_DB")
REDIS_MAPPINGS_HOST = os.getenv("REDIS_MAPPINGS_HOST")
REDIS_MAPPINGS_PORT = os.getenv("REDIS_MAPPINGS_PORT")
REDIS_MAPPINGS_DB = os.getenv("REDIS_MAPPINGS_DB")
ENV = os.getenv("ENV")
IN_PROD = ENV != "test"


def get_redis_counter_client():
    if "redis_counter_client" not in g:
        g.redis_counter_client = redis.Redis(
            host=REDIS_COUNTER_HOST, port=REDIS_COUNTER_PORT, db=REDIS_COUNTER_DB
        )
    return g.redis_counter_client


def get_redis_mappings_client():
    if "redis_mappings_client" not in g:
        g.redis_mappings_client = redis.Redis(
            host=REDIS_MAPPINGS_HOST, port=REDIS_MAPPINGS_PORT, db=REDIS_MAPPINGS_DB
        )
    return g.redis_mappings_client


####################
# LOADER FLASK API #
####################

def create_app():
    _app = Flask(__name__)

    # load redis client
    with _app.app_context():
        get_redis_mappings_client()

    with _app.app_context():
        get_redis_counter_client()

    return _app


app = create_app()


@app.route("/delete-resources", methods=["POST"])
def delete_resources():
    body = request.get_json()
    resources = body.get("resources", None)

    for resource in resources:
        resource_id = resource.get("resource_id")
        resource_type = resource.get("resource_type")
        logger.info(
            f"Deleting all documents of type {resource_type} with resource id {resource_id}",
            extra={"resource_id": resource_id},
        )

        # Call fhirstore.delete
        fhirstore = get_fhirstore()
        try:
            fhirstore.delete(resource_type, resource_id=resource_id)
        except NotFoundError:
            logger.info(
                f"No documents for resource {resource_id} were found",
                extra={"resource_id": resource_id},
            )
            pass

    return jsonify(success=True)


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


#######################
# LOADER KAFKA CLIENT #
#######################

CONSUMED_TOPICS = "^transform\\..*"
CONSUMER_GROUP_ID = "loader"
PRODUCED_TOPIC_PREFIX = "load."


# these decorators tell uWSGI (the server with which the app is run)
# to spawn a new thread every time a worker starts. Hence the consumer
# is started at the same time as the Flask API.
@postfork
@thread
def run_consumer():
    logger.info("Running Consumer")

    producer = LoaderProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))
    consumer = LoaderConsumer(
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
    # Mongo client need to be called in each separate process
    fhirstore = get_fhirstore()
    loader = Loader(fhirstore)
    binder = ReferenceBinder(fhirstore)
    redis_client = get_redis_counter_client()
    redis_mappings_client = get_redis_mappings_client()
    analyzer = Analyzer(redis_client=redis_mappings_client)

    def process_event(msg):
        """ Process the event """
        msg_value = json.loads(msg.value())
        logger.debug(msg_value)
        fhir_instance = msg_value.get("fhir_object")
        batch_id = msg_value.get("batch_id")
        resource_id = msg_value.get("resource_id")

        try:
            analysis = analyzer.load_cached_analysis(batch_id, resource_id)

            # Resolve existing and pending references (if the fhir_instance
            # references OR is referenced by other documents)
            logger.debug(
                f"Resolving references {analysis.reference_paths}",
                extra={"resource_id": resource_id},
            )
            resolved_fhir_instance = binder.resolve_references(
                fhir_instance, analysis.reference_paths
            )

            logger.debug("Writing document to mongo", extra={"resource_id": resource_id})
            loader.load(
                resolved_fhir_instance, resource_type=resolved_fhir_instance["resourceType"],
            )
            # Increment loaded resources counter in Redis
            redis_client.hincrby(f"batch:{batch_id}:counter", f"resource:{resource_id}:loaded", 1)
            producer.produce_event(
                topic=PRODUCED_TOPIC_PREFIX + batch_id,
                record={"batch_id": batch_id}
            )
        except DuplicateKeyError:
            logger.error(format_traceback())

    return process_event


def manage_kafka_error(msg):
    """
    Deal with the error if nany
    :param msg:
    :return:
    """
    logger.error(msg.error())
