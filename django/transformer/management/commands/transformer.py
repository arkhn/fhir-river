import logging
import json


from django.conf import settings
from django.core.management.base import BaseCommand


from confluent_kafka import KafkaException, KafkaError
import redis

from common.analyzer import Analyzer
from transformer.kafka.consumer import TransformerConsumer
from transformer.kafka.producer import TransformerProducer
from transformer.transform import Transformer
from transformer.errors import OperationOutcome
from transformer.conf import conf


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__file__)


transformer = Transformer()


def transform_row(analysis, row):
    primary_key_value = row[analysis.primary_key_column.dataframe_column_name()][0]
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
            e,
            extra={
                "resource_id": analysis.resource_id,
                "primary_key_value": primary_key_value,
            },
        )
        raise OperationOutcome(f"Failed to transform {row}:\n{e}") from e


def manage_kafka_error(msg):
    logger.error(msg.error().str())


def process_event_with_context(producer):
    redis_client = redis.Redis(
        host=settings.REDIS_MAPPINGS_HOST,
        port=settings.REDIS_MAPPINGS_PORT,
        db=settings.REDIS_MAPPINGS_DB,
    )
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
                topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}",
                record={
                    "fhir_object": fhir_document,
                    "batch_id": batch_id,
                    "resource_id": resource_id,
                },
            )
        except OperationOutcome:
            pass
        except Exception as err:
            logger.error(err)

    return process_event


class Command(BaseCommand):
    def handle(self, *args, **options):

        logger.info("Running transform consumer")

        producer = TransformerProducer(broker=settings.KAFKA_BOOTSTRAP_SERVERS)
        consumer = TransformerConsumer(
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
