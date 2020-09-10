#!/usr/bin/env python

from confluent_kafka import KafkaException, KafkaError
from flask import Flask, request, jsonify, Response
import json
import os
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from pymongo.errors import DuplicateKeyError
from uwsgidecorators import thread, postfork

from fhirstore import NotFoundError

from analyzer.src.analyze import Analyzer
from analyzer.src.analyze.graphql import PyrogClient

from loader.src.config.logger import get_logger
from loader.src.load import Loader
from loader.src.load.fhirstore import get_fhirstore
from loader.src.load.utils import get_resource_id
from loader.src.reference_binder import ReferenceBinder
from loader.src.consumer_class import LoaderConsumer
from loader.src.producer_class import LoaderProducer


CONSUMED_TOPIC = "transform"
PRODUCED_TOPIC = "load"
CONSUMER_GROUP_ID = "loader"

logger = get_logger()

fhirstore = get_fhirstore()

loader = Loader(fhirstore)
analyzer = Analyzer(PyrogClient())
binder = ReferenceBinder(fhirstore)


def create_app():
    app = Flask(__name__)
    return app


app = create_app()


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


def process_event_with_producer(producer):
    def process_event(msg):
        """
        Process the event
        :param msg:
        :return:
        """
        logger.debug(msg.value())

        # TODO clean this big try/except
        try:
            fhir_instance = json.loads(msg.value())
            resource_id = get_resource_id(fhir_instance)

            logger.debug("Get Analysis", extra={"resource_id": resource_id})
            # FIXME: filter meta.tags by system to get the right
            # resource_id (ARKHN_CODE_SYSTEMS.resource)
            analysis = analyzer.get_analysis(resource_id)

            # Resolve existing and pending references (if the fhir_instance
            # references OR is referenced by other documents)
            logger.debug(
                f"Resolving references {analysis.reference_paths}",
                extra={"resource_id": resource_id},
            )
            resolved_fhir_instance = binder.resolve_references(
                fhir_instance, analysis.reference_paths
            )

            # TODO how will we handle override in fhir-river?
            # if True:  # should be "if override:" or something like that
            #     override_document(resolved_fhir_instance)
        except Exception as err:
            logger.error(err)

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
    """Deal with the error if any """
    logger.error(msg.error().str())


@app.route("/delete-resources", methods=["POST"])
def delete_resources():
    body = request.get_json()
    resource_ids = body.get("resource_ids", None)

    for resource_id in resource_ids:
        logger.info(
            f"Deleting all documents for resource {resource_id}",
            extra={"resource_id": resource_id},
        )
        # Fetch analysis to get resource type
        analysis = analyzer.get_analysis(resource_id)
        resource_type = analysis.definition_id

        # Call fhirstore.delete
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
        topics=CONSUMED_TOPIC,
        group_id=CONSUMER_GROUP_ID,
        process_event=process_event_with_producer(producer),
        manage_error=manage_kafka_error,
    )

    try:
        consumer.run_consumer()
    except (KafkaException, KafkaError) as err:
        logger.error(err)
