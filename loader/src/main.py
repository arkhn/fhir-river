#!/usr/bin/env python

from confluent_kafka import KafkaException, KafkaError
import json
import os
from prometheus_client import start_http_server
from pymongo.errors import DuplicateKeyError

from arkhn_monitoring import Timer
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

METRICS_PORT = int(os.getenv("METRICS_PORT", 3003))

logger = get_logger()

fhirstore = get_fhirstore()

# TODO how will we handle bypass_validation in fhir-river?
loader = Loader(fhirstore, bypass_validation=False)
analyzer = Analyzer(PyrogClient())
binder = ReferenceBinder(fhirstore)


@Timer("time_override", "time to delete a potential document with the same identifier")
def override_document(fhir_instance):
    try:
        # TODO add a wrapper method in fhirstore to delete as follows?
        fhirstore.db[fhir_instance["resourceType"]].delete_one(
            {"identifier": fhir_instance["identifier"]}
        )
    except KeyError:
        logger.warning(
            f"instance {fhir_instance['id']} has no identifier",
            extra={"resource_id": get_resource_id(fhir_instance)},
        )
    except NotFoundError as e:
        # With the current policy of trying to delete a document with the same
        # identifier before each insertion, we may catch this Exception most of the time.
        # That's why the logging level is set to DEBUG.
        # TODO: better override strategy
        logger.debug(f"error while trying to delete previous documents: {e}")


def process_event_with_producer(producer):
    def process_event(msg):
        """
        Process the event
        :param msg:
        :return:
        """
        fhir_instance = json.loads(msg.value())
        resource_id = get_resource_id(fhir_instance)

        logger.debug("Get Analysis", extra={"resource_id": resource_id})
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
        if True:  # should be "if override:" or something like that
            override_document(resolved_fhir_instance)

        try:
            logger.debug("Writing document to mongo", extra={"resource_id": resource_id})
            loader.load(
                resolved_fhir_instance,
                resource_type=resolved_fhir_instance["resourceType"],
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


if __name__ == "__main__":
    logger.info("Running Consumer")

    start_http_server(METRICS_PORT)

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
