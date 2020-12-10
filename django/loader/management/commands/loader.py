import json
import logging

from django.conf import settings
from django.core.management.base import BaseCommand


from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from confluent_kafka import KafkaException, KafkaError
import redis

from common.analyzer import Analyzer
from loader.kafka.consumer import LoaderConsumer
from loader.kafka.producer import LoaderProducer
from loader.load import Loader
from loader.reference_binder import ReferenceBinder
from loader.conf import conf
from loader.load.fhirstore import get_fhirstore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__file__)


def manage_kafka_error(msg):
    logger.error(msg.error().str())


def process_event_with_context(producer):
    fhirstore_client = get_fhirstore()
    loader = Loader(fhirstore_client)
    binder = ReferenceBinder(fhirstore_client)
    redis_counter_client = redis.Redis(
        host=settings.REDIS_COUNTER_HOST,
        port=settings.REDIS_COUNTER_PORT,
        db=settings.REDIS_COUNTER_DB,
    )
    redis_mappings_client = redis.Redis(
        host=settings.REDIS_MAPPINGS_HOST,
        port=settings.REDIS_MAPPINGS_PORT,
        db=settings.REDIS_MAPPINGS_DB,
    )
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

            logger.debug(
                "Writing document to mongo", extra={"resource_id": resource_id}
            )
            loader.load(
                resolved_fhir_instance,
                resource_type=resolved_fhir_instance["resourceType"],
            )
            # Increment loaded resources counter in Redis
            redis_counter_client.hincrby(
                f"batch:{batch_id}:counter", f"resource:{resource_id}:loaded", 1
            )
            producer.produce_event(
                topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}",
                record={"batch_id": batch_id},
            )
        except DuplicateKeyError as err:
            logger.error(err)

    return process_event


class Command(BaseCommand):
    def handle(self, *args, **options):

        logger.info("Running consumer")

        producer = LoaderProducer(broker=settings.KAFKA_BOOTSTRAP_SERVERS)
        consumer = LoaderConsumer(
            broker=settings.KAFKA_BOOTSTRAP_SERVERS,
            topics=conf.CONSUMED_TOPICS,
            group_id=conf.CONSUMER_GROUP_ID,
            process_event=process_event_with_context(producer),
            manage_error=manage_kafka_error,
        )

        try:
            consumer.run_consumer()
        except (KafkaException, KafkaError) as err:
            logger.error(err)