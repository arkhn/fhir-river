#!/usr/bin/env python

import json
import os

from confluent_kafka import KafkaException, KafkaError
from flask import Flask, request, jsonify, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from pymongo.errors import DuplicateKeyError
from typing import Dict
from uwsgidecorators import thread, postfork

from fhirstore import NotFoundError

from analyzer.src.analyze import Analyzer
from analyzer.src.analyze.graphql import PyrogClient
from loader.src.config.service_logger import logger
from loader.src.load import Loader
from loader.src.load.fhirstore import get_fhirstore
from loader.src.reference_binder import ReferenceBinder
from loader.src.consumer_class import LoaderConsumer
from loader.src.producer_class import LoaderProducer


# analyzers is a map of Analyzer indexed by batch_id
analyzers: Dict[str, Analyzer] = {}
# users_tokens is a map of {auth_token: str, id_token: str} indexed by batch_id
users_tokens: Dict[str, Dict[str, str]] = {}

####################
# LOADER FLASK API #
####################


app = Flask(__name__)


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
def handle_bad_request(e):
    return str(e), 400


#######################
# LOADER KAFKA CLIENT #
#######################

CONSUMED_BATCH_TOPIC = "batch"
CONSUMED_TRANSFORM_TOPIC = "transform"
PRODUCED_TOPIC = "load"
CONSUMER_GROUP_ID = "loader"


# these decorators tell uWSGI (the server with which the app is run)
# to spawn a new thread every time a worker starts. Hence the consumer
# is started at the same time as the Flask API.
@postfork
@thread
def run_batch_consumer():
    logger.info("Running batch consumer")

    consumer = LoaderConsumer(
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


@postfork
@thread
def run_consumer():
    logger.info("Running Consumer")

    producer = LoaderProducer(broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"))
    consumer = LoaderConsumer(
        broker=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
        topics=CONSUMED_TRANSFORM_TOPIC,
        group_id=CONSUMER_GROUP_ID,
        process_event=process_event_with_producer(producer),
        manage_error=manage_kafka_error,
    )

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logger.error(err)


def process_batch_event(msg):
    msg_value = json.loads(msg.value())
    batch_id = msg_value.get("batch_id")

    if batch_id not in users_tokens:
        logger.info(f"Caching tokens for batch {batch_id}")
        auth_header = msg_value.get("auth_header", None)
        id_token = msg_value.get("id_token", None)
        users_tokens[batch_id] = {"auth_header": auth_header, "id_token": id_token}


def process_event_with_producer(producer):
    # Mongo client need to be called in each separate process
    fhirstore = get_fhirstore()
    loader = Loader(fhirstore)
    binder = ReferenceBinder(fhirstore)

    def process_event(msg):
        """ Process the event """
        msg_value = json.loads(msg.value())
        logger.debug(msg_value)
        fhir_instance = msg_value.get("fhir_object")
        batch_id = msg_value.get("batch_id")
        resource_id = msg_value.get("resource_id")

        analyzer = analyzers.get(batch_id)
        if not analyzer:
            tokens = users_tokens.get(batch_id)
            if not tokens:
                logger.error(f"Tokens not found for batch {batch_id}, aborting")
                return
            pyrog_client = PyrogClient(tokens["auth_header"], tokens["id_token"])
            analyzer = Analyzer(pyrog_client)
            analyzers[batch_id] = analyzer
        # FIXME: filter meta.tags by system to get the right
        # resource_id (ARKHN_CODE_SYSTEMS.resource)
        analysis = analyzer.get_analysis(resource_id)

        # Resolve existing and pending references (if the fhir_instance
        # references OR is referenced by other documents)
        logger.debug(
            f"Resolving references {analysis.reference_paths}", extra={"resource_id": resource_id}
        )
        resolved_fhir_instance = binder.resolve_references(fhir_instance, analysis.reference_paths)

        # TODO how will we handle override in fhir-river?
        # if True:  # should be "if override:" or something like that
        #     override_document(resolved_fhir_instance)

        try:
            logger.debug("Writing document to mongo", extra={"resource_id": resource_id})
            loader.load(
                resolved_fhir_instance, resource_type=resolved_fhir_instance["resourceType"],
            )
            producer.produce_event(topic=PRODUCED_TOPIC, record=resolved_fhir_instance)
        except DuplicateKeyError as e:
            logger.error(e)

    return process_event


def manage_kafka_error(msg):
    """
    Deal with the error if nany
    :param msg:
    :return:
    """
    logger.error(msg.error())

# @Timer("time_override", "time to delete a potential document with the same identifier")
# def override_document(fhir_instance):
#     try:
#         # TODO add a wrapper method in fhirstore to delete as follows?
#         fhirstore.db[fhir_instance["resourceType"]].delete_one(
#             {"identifier": fhir_instance["identifier"]}
#         )
#     except KeyError:
#         logger.warning(
#             f"instance {fhir_instance['id']} has no identifier",
#             extra={"resource_id": get_resource_id(fhir_instance)},
#         )
#     except NotFoundError as e:
#         # With the current policy of trying to delete a document with the same
#         # identifier before each insertion, we may catch this Exception most of the time.
#         # That's why the logging level is set to DEBUG.
#         # TODO: better override strategy
#         logger.debug(f"error while trying to delete previous documents: {e}")
