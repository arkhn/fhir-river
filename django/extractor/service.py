import logging

from django.conf import settings

import redis
from common.analyzer import Analyzer
from common.database_connection.db_connection import DBConnection
from common.kafka.consumer import Consumer
from common.kafka.producer import Producer
from common.service.event import Event
from common.service.handler import Handler
from common.service.service import Service
from confluent_kafka import KafkaError, KafkaException
from extractor.conf import conf
from extractor.extract import Extractor

logger = logging.getLogger(__name__)


def broadcast_events(
    dataframe,
    analysis,
    producer: Producer,
    counter_client: redis.Redis,
    received_event_data,
):
    resource_type = analysis.definition_id
    resource_id = analysis.resource_id
    batch_id = received_event_data["batch_id"]
    batch_type = received_event_data["batch_type"]
    count = 0
    # FIXME: Can we do better? It's to make sure this counter is ok
    # in the recurring case
    counter_client.hset(f"{batch_type}:{batch_id}:counter", f"resource:{resource_id}:loaded", 0)

    list_records_from_db = Extractor.split_dataframe(dataframe, analysis)
    for record in list_records_from_db:
        try:
            logger.debug(
                {"message": "One record from extract", "resource_id": resource_id},
            )
            event = dict()
            event["batch_id"] = batch_id
            event["batch_type"] = batch_type
            event["resource_type"] = resource_type
            event["resource_id"] = resource_id
            event["record"] = record
            producer.produce_event(
                topic=f"{conf.PRODUCED_TOPIC_PREFIX}.{batch_type}.{batch_id}",
                event=event,
            )
            count += 1
        except (KafkaException, ValueError) as err:
            if isinstance(err, KafkaException) and err.args[0].code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
                logger.warning(
                    {
                        "message": "The current batch has been cancelled",
                        "resource_id": resource_id,
                        "batch_id": batch_id,
                    }
                )
            else:
                logger.exception(err)
            # return early to avoid setting the counter in redis
            return

    # Initialize a batch counter in Redis. For each resource_id, it sets
    # the number of produced records
    counter_client.hset(f"{batch_type}:{batch_id}:counter", f"resource:{resource_id}:extracted", count)
    logger.info(
        {
            "message": f"Batch {batch_id} size is {count} for resource type {analysis.definition_id}",
            "resource_id": resource_id,
        },
    )


class ExtractHandler(Handler):
    def __init__(
        self,
        producer: Producer,
        counter_redis: redis.Redis,
        analyzer: Analyzer,
    ) -> None:
        self.producer = producer
        self.counter_redis = counter_redis
        self.analyzer = analyzer

    def __call__(self, event: Event):
        batch_id = event.data["batch_id"]
        resource_id = event.data["resource_id"]
        primary_key_values = event.data.get("primary_key_values", None)

        analysis = self.analyzer.load_cached_analysis(batch_id, resource_id)
        db_connection = DBConnection(analysis.source_credentials)
        with db_connection.session_scope() as session:
            extractor = Extractor(session, db_connection.metadata)
            query = extractor.extract(analysis, primary_key_values)

            broadcast_events(query, analysis, self.producer, self.counter_redis, event.data)


class ExtractorService(Service):
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
        counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
        )
        analyzer = Analyzer(redis_client=mapping_redis)
        handler = ExtractHandler(
            producer=Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS),
            counter_redis=counter_redis,
            analyzer=analyzer,
        )
        return Service(consumer, handler)
