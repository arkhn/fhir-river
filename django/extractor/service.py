import logging
from typing import List, Optional

from django.conf import settings

import redis

from common.service.application import Application
from common.service.event import Event
from common.service.handler import Handler
from common.kafka.consumer import Consumer
from common.kafka.producer import Producer
from common.analyzer import Analyzer

from extractor.conf import conf
from extractor.extract import Extractor
from extractor.errors import MissingInformationError, EmptyResult

logger = logging.getLogger(__name__)


def broadcast_events(
    dataframe,
    analysis,
    producer: Producer,
    extractor: Extractor,
    counter_client: redis.Redis,
    batch_id=None,
):
    resource_type = analysis.definition_id
    resource_id = analysis.resource_id
    count = 0
    try:
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
            producer.produce_event(
                topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}", event=event
            )
            count += 1
    except EmptyResult as e:
        logger.warn(e, extra={"resource_id": resource_id, "batch_id": batch_id})
    # Initialize a batch counter in Redis. For each resource_id, it records
    # the number of produced records
    counter_client.hset(
        f"batch:{batch_id}:counter", f"resource:{resource_id}:extracted", count
    )
    logger.info(
        f"Batch {batch_id} size is {count} for resource type {analysis.definition_id}",
        extra={"resource_id": resource_id},
    )


def extract(
    producer: Producer,
    counter_client: redis.Redis,
    extractor: Extractor,
    analyzer: Analyzer,
    resource_id: str,
    batch_id: Optional[str] = None,
    primary_key_values: Optional[List[str]] = None,
):
    try:
        analysis = analyzer.load_cached_analysis(batch_id, resource_id)

        if not analysis.source_credentials:
            raise MissingInformationError("credential is required to run fhir-river.")

        credentials = analysis.source_credentials
        extractor.update_connection(credentials)

        logger.info("Extracting rows", extra={"resource_id": analysis.resource_id})
        df = extractor.extract(analysis, primary_key_values)

        batch_size = extractor.batch_size(analysis)
        logger.info(
            f"Batch size is {batch_size} for resource type {analysis.definition_id}",
            extra={"resource_id": resource_id},
        )

        producer.produce_event(
            topic=conf.BATCH_SIZE_TOPIC,
            event={"batch_id": batch_id, "size": batch_size},
        )
        broadcast_events(df, analysis, producer, extractor, counter_client, batch_id)

    except Exception as err:
        logger.error(err, extra={"resource_id": resource_id}, exc_info=True)


class ExtractHandler(Handler):
    def __init__(
        self,
        producer: Producer,
        extractor: Extractor,
        counter_redis: redis.Redis,
        analyzer: Analyzer,
    ) -> None:
        self.producer = producer
        self.extractor = extractor
        self.counter_redis = counter_redis
        self.analyzer = analyzer

    def __call__(self, event: Event):
        extract(
            producer=self.producer,
            extractor=self.extractor,
            counter_client=self.counter_redis,
            analyzer=self.analyzer,
            **event.data,
        )


class ExtractorApplication(Application):
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
        counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
        )
        analyzer = Analyzer(redis_client=mapping_redis)
        handler = ExtractHandler(
            producer=Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS),
            extractor=Extractor(),
            counter_redis=counter_redis,
            analyzer=analyzer,
        )
        return Application(consumer, handler)
