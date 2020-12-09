import logging
import json


from django.conf import settings
from django.core.management.base import BaseCommand


from confluent_kafka import KafkaException, KafkaError
import redis

from common.analyzer import Analyzer
from common.kafka.consumer import ExtractorConsumer
from common.kafka.producer import ExtractorProducer
from extractor.errors import MissingInformationError
from extractor.extract import Extractor
from extractor.conf import conf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__file__)


extractor = Extractor()


def extract_resource(analysis, primary_key_values):
    if not analysis.source_credentials:
        raise MissingInformationError("credential is required to run fhir-river.")

    credentials = analysis.source_credentials
    extractor.update_connection(credentials)

    logger.info("Extracting rows", extra={"resource_id": analysis.resource_id})
    df = extractor.extract(analysis, primary_key_values)

    return df


def manage_kafka_error(msg):
    logger.error(msg.error().str())


def process_event_with_context(producer):
    redis_client = redis.Redis(
        host=settings.REDIS_MAPPINGS_HOST,
        port=settings.REDIS_MAPPINGS_PORT,
        db=settings.REDIS_MAPPINGS_DB,
    )
    analyzer = Analyzer(redis_client=redis_client)

    def broadcast_events(dataframe, analysis, batch_id=None):
        resource_type = analysis.definition_id
        resource_id = analysis.resource_id
        list_records_from_db = extractor.split_dataframe(dataframe, analysis)

        for record in list_records_from_db:
            logger.debug(
                "One record from extract",
                extra={"resource_id": resource_id},
            )
            event = dict()
            event["batch_id"] = batch_id
            event["resource_type"] = resource_type
            event["resource_id"] = resource_id
            event["record"] = record

            producer.produce_event(topic=conf.EXTRACT_TOPIC, event=event)

    def process_event(msg):
        msg_value = json.loads(msg.value())
        resource_id = msg_value.get("resource_id", None)
        primary_key_values = msg_value.get("primary_key_values", None)
        batch_id = msg_value.get("batch_id", None)

        msg_topic = msg.topic()

        logger.info(
            f"Event ready to be processed (topic: {msg_topic})",
            extra={"resource_id": resource_id},
        )

        try:
            analysis = analyzer.load_cached_analysis(batch_id, resource_id)

            df = extract_resource(analysis, primary_key_values)
            batch_size = extractor.batch_size(analysis)
            logger.info(
                f"Batch size is {batch_size} for resource type {analysis.definition_id}",
                extra={"resource_id": resource_id},
            )
            producer.produce_event(
                topic=conf.BATCH_SIZE_TOPIC,
                event={"batch_id": batch_id, "size": batch_size},
            )
            broadcast_events(df, analysis, batch_id)

        except Exception as err:
            logger.error(err, extra={"resource_id": resource_id})

    return process_event


class Command(BaseCommand):
    def handle(self, *args, **options):

        logger.info("Running extract consumer")

        producer = ExtractorProducer(broker=settings.KAFKA_BOOTSTRAP_SERVERS)
        consumer = ExtractorConsumer(
            broker=settings.KAFKA_BOOTSTRAP_SERVERS,
            topics=conf.CONSUMED_TOPIC,
            group_id=conf.CONSUMER_GROUP_ID,
            process_event=process_event_with_context(producer),
            manage_error=manage_kafka_error,
        )

        try:
            consumer.run_consumer()
        except (KafkaException, KafkaError) as err:
            logger.error(err)
