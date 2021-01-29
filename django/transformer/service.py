import logging

from django.conf import settings

import redis
from common.analyzer import Analyzer
from common.kafka.consumer import Consumer
from common.kafka.producer import Producer
from common.service.event import Event
from common.service.handler import Handler
from common.service.service import Service
from transformer.conf import conf
from transformer.errors import OperationOutcome, BatchCancelled
from transformer.transform import Transformer

logger = logging.getLogger(__name__)


def transform_row(analysis, row, transformer: Transformer):
    primary_key_value = row[analysis.primary_key_column.dataframe_column_name()][0]
    logging_extras = {
        "resource_id": analysis.resource_id,
        "primary_key_value": primary_key_value,
    }

    try:
        logger.debug({"message": "Transform dataframe", **logging_extras})
        data = transformer.transform_data(row, analysis)

        logger.debug({"message": "Create FHIR Doc", **logging_extras})
        fhir_document = transformer.create_fhir_document(data, analysis)

        return fhir_document

    except Exception as e:
        logger.exception(
            {"message": str(e), **logging_extras},
        )
        raise OperationOutcome(f"Failed to transform {row}:\n{e}") from e


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
        batch_id = event.data["batch_id"]
        resource_id = event.data["resource_id"]
        record = event.data["record"]

        analysis = self.analyzer.load_cached_analysis(batch_id, resource_id)
        fhir_object = transform_row(analysis, record, transformer=self.transformer)
        try:
            self.producer.produce_event(
                topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}",
                event={
                    "fhir_object": fhir_object,
                    "batch_id": batch_id,
                    "resource_id": resource_id,
                },
            )
        except BatchCancelled as err:
            logger.warning({"message": str(err), "resource_id": resource_id, "batch_id": batch_id})


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
