import logging

import redis

from django.conf import settings

from common.analyzer import Analyzer
from common.kafka.consumer import Consumer
from common.kafka.producer import Producer
from common.service.service import Service
from common.service.event import Event
from common.service.handler import Handler

from common.analyzer import Analyzer
from common.kafka.consumer import Consumer
from common.kafka.producer import Producer
from transformer.transform import Transformer
from transformer.errors import OperationOutcome
from transformer.conf import conf


logger = logging.getLogger(__name__)


def transform_row(analysis, row, transformer: Transformer):
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


def transform(
    batch_id: str,
    resource_id: str,
    resource_type: str,
    record: str,
    producer: Producer,
    transformer: Transformer,
    analyzer: Analyzer,
):
    logger.info(f"Processing 1 event from batch {batch_id}")

    try:
        analysis = analyzer.load_cached_analysis(batch_id, resource_id)

        fhir_document = transform_row(analysis, record, transformer=transformer)
        producer.produce_event(
            topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}",
            event={
                "fhir_object": fhir_document,
                "batch_id": batch_id,
                "resource_id": resource_id,
            },
        )
    except OperationOutcome:
        pass
    except Exception as err:
        logger.error(err)


class TransformHandler(Handler):
    def __init__(
        self,
        producer: Producer,
        transformer: Transformer,
        analyzer: Analyzer,
    ) -> None:
        self.producer = producer
        self.transformer = transformer
        self.analyzer = analyzer

    def __call__(self, event: Event):
        transform(
            producer=self.producer,
            transformer=self.transformer,
            analyzer=self.analyzer,
            **event.data,
        )


class TransformerService(Service):
    @classmethod
    def make_app(cls):
        consumer = Consumer(
            broker=settings.KAFKA_BOOTSTRAP_SERVERS,
            topics=conf.CONSUMED_TOPICS,
            group_id=conf.CONSUMER_GROUP_ID,
        )
        mapping_redis = redis.Redis(
            host=settings.REDIS_MAPPINGS_HOST,
            port=settings.REDIS_MAPPINGS_PORT,
            db=settings.REDIS_MAPPINGS_DB,
        )
        analyzer = Analyzer(redis_client=mapping_redis)
        handler = TransformHandler(
            producer=Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS),
            transformer=Transformer(),
            analyzer=analyzer,
        )
        return Service(consumer, handler)
