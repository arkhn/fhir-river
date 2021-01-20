import logging

from django.conf import settings
from prometheus_client import Counter as PromCounter

import redis
from common.analyzer import Analyzer
from common.kafka.consumer import Consumer
from common.kafka.producer import Producer
from common.service.event import Event
from common.service.handler import Handler
from common.service.service import Service
from extractor.conf import conf
from extractor.errors import EmptyResult
from extractor.extract import Extractor

logger = logging.getLogger(__name__)
counter_extract_instances = PromCounter(
    "count_extracted_instances", "Number of resource instances extracted", labelnames=("resource_id", "resource_type"),
)


def broadcast_events(
    dataframe, analysis, producer: Producer, extractor: Extractor, counter_client: redis.Redis, batch_id=None,
):
    resource_type = analysis.definition_id
    resource_id = analysis.resource_id
    count = 0
    try:
        for row in dataframe:
            counter_extract_instances.labels(
                resource_id=analysis.resource_id, resource_type=analysis.definition_id
            ).inc()
            row = {key: value for key, value in zip(row.keys(), row)}
            logger.debug({"message": "One record from extract", "resource_id": resource_id})
            event = dict()
            event["batch_id"] = batch_id
            event["resource_type"] = resource_type
            event["resource_id"] = resource_id
            event["record"] = row
            producer.produce_event(topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}", event=event)
            count += 1
    except EmptyResult as e:
        logger.warn({"message": str(e), "resource_id": resource_id, "batch_id": batch_id})
    # Initialize a batch counter in Redis. For each resource_id, it records
    # the number of produced records
    counter_client.hset(f"batch:{batch_id}:counter", f"resource:{resource_id}:extracted", count)
    logger.info(
        {
            "message": f"Batch {batch_id} size is {count} for resource type {analysis.definition_id}",
            "resource_id": resource_id,
        },
    )


class ExtractHandler(Handler):
    def __init__(
        self, producer: Producer, extractor: Extractor, counter_redis: redis.Redis, analyzer: Analyzer,
    ) -> None:
        self.producer = producer
        self.extractor = extractor
        self.counter_redis = counter_redis
        self.analyzer = analyzer

    def __call__(self, event: Event):
        batch_id = event.data["batch_id"]
        resource_id = event.data["resource_id"]
        primary_key_values = event.data.get("primary_key_values", None)

        analysis = self.analyzer.load_cached_analysis(batch_id, resource_id)
        credentials = analysis.source_credentials
        self.extractor.update_connection(credentials)
        query = self.extractor.extract(analysis, primary_key_values)

        broadcast_events(query, analysis, self.producer, self.extractor, self.counter_redis, batch_id)


class ExtractorService(Service):
    @classmethod
    def make_app(cls):
        consumer = Consumer(
            broker=settings.KAFKA_BOOTSTRAP_SERVERS, topics=conf.CONSUMED_TOPICS, group_id=conf.CONSUMER_GROUP_ID,
        )
        mapping_redis = redis.Redis(
            host=settings.REDIS_MAPPINGS_HOST, port=settings.REDIS_MAPPINGS_PORT, db=settings.REDIS_MAPPINGS_DB,
        )
        counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST, port=settings.REDIS_COUNTER_PORT, db=settings.REDIS_COUNTER_DB,
        )
        analyzer = Analyzer(redis_client=mapping_redis)
        handler = ExtractHandler(
            producer=Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS),
            extractor=Extractor(),
            counter_redis=counter_redis,
            analyzer=analyzer,
        )
        return Service(consumer, handler)
