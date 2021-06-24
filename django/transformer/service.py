import json
import logging

import redis
from confluent_kafka import KafkaError, KafkaException

from django.conf import settings

from adapters.mappings import RedisMappingsRepository
from common.analyzer import Analyzer
from common.errors import OperationOutcome
from common.kafka.consumer import Consumer
from common.kafka.producer import Producer
from common.service.event import Event
from common.service.handler import Handler
from common.service.service import Service
from transformer.conf import conf
from transformer.reference_binder import ReferenceBinder
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
        data = transformer.transform_data(row, analysis, primary_key_value)

        logger.debug({"message": "Create FHIR Doc", **logging_extras})
        fhir_document = transformer.create_fhir_document(data, analysis, primary_key_value)

        return fhir_document

    except Exception as e:
        logger.exception({"message": str(e), **logging_extras},)
        raise OperationOutcome(f"Failed to transform {row}:\n{e}") from e


class TransformHandler(Handler):
    def __init__(
        self,
        producer: Producer,
        transformer: Transformer,
        binder: ReferenceBinder,
        mapping_repository: MappingsRepository,
        analyzer: Analyzer,
    ) -> None:
        self.producer = producer
        self.transformer = transformer
        self.binder = binder
        self.mapping_repository = mapping_repository
        self.analyzer = analyzer

    def __call__(self, event: Event):
        batch_id = event.data["batch_id"]
        resource_id = event.data["resource_id"]
        record = event.data["record"]

        mapping = self.mapping_repository.get(batch_id, resource_id)
        analysis = self.analyzer.load_cached_analysis(batch_id, resource_id, mapping)

        fhir_object = transform_row(analysis, record, transformer=self.transformer)

        # Resolve references
        logger.debug(
            {
                "message": f"Resolving references {analysis.reference_paths} for resource {fhir_object['id']}",
                "batch_id": batch_id,
                "resource_id": resource_id,
                "label": analysis.label,
                "definition_id": analysis.definition_id,
            },
        )
        resolved_fhir_instance = self.binder.resolve_references(
            fhir_object, analysis.reference_paths
        )

        try:
            self.producer.produce_event(
                topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}",
                event={
                    "fhir_object": resolved_fhir_instance,
                    "batch_id": batch_id,
                    "resource_id": resource_id,
                },
            )
        except KafkaException as err:
            if err.args[0].code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
                logger.warning(
                    {
                        "message": "The current batch has been cancelled",
                        "resource_id": resource_id,
                        "batch_id": batch_id,
                    }
                )
            else:
                logger.exception(err)
        except ValueError as err:
            logger.exception(err)


class TransformerService(Service):
    @classmethod
    def make_app(cls):
        config = {"max.poll.interval.ms": conf.MAX_POLL_INTERVAL_MS}

        consumer = Consumer(
            broker=settings.KAFKA_BOOTSTRAP_SERVERS,
            topics=conf.CONSUMED_TOPICS,
            group_id=conf.CONSUMER_GROUP_ID,
            config=config,
        )
        mapping_redis = redis.Redis(
            host=settings.REDIS_MAPPINGS_HOST,
            port=settings.REDIS_MAPPINGS_PORT,
            db=settings.REDIS_MAPPINGS_DB,
        )
        mapping_repository = RedisMappingsRepository(mapping_redis)
        analyzer = Analyzer()
        handler = TransformHandler(
            producer=Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS),
            transformer=Transformer(),
            binder=ReferenceBinder(),
            mapping_repository=mapping_repository,
            analyzer=analyzer,
        )
        return Service(consumer, handler)
