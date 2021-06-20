import logging

from confluent_kafka import KafkaError, KafkaException

from river import models
from river.adapters.decr_counter import DecrementingCounter, RedisDecrementingCounter
from river.adapters.event_publisher import EventPublisher, KafkaEventPublisher
from river.adapters.event_subscriber import KafkaEventSubscriber
from river.common.analyzer import Analyzer
from river.common.database_connection.db_connection import DBConnection
from river.common.service.errors import BatchCancelled
from river.common.service.service import Service
from river.domain import events
from river.extractor.extractor import Extractor
from river.parsing import Source, as_old_mapping
from utils.caching import CacheBackend, RedisCacheBackend

logger = logging.getLogger(__name__)


def broadcast_events(
    dataframe,
    analysis,
    publisher: EventPublisher,
    counter: DecrementingCounter,
    batch_id=None,
):
    resource_type = analysis.definition_id
    resource_id = analysis.resource_id
    count = 0
    list_records_from_db = Extractor.split_dataframe(dataframe, analysis)
    for record in list_records_from_db:
        try:
            logger.debug(
                {"message": "One record from extract", "resource_id": resource_id},
            )
            event = events.ExtractedRecord(batch_id, resource_type, resource_id, record)
            publisher.publish(topic=f"extract.{batch_id}", event=event)
            count += 1
        except KafkaException as err:
            if err.args[0].code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
                logger.warning(
                    {
                        "message": "The current batch has been cancelled",
                        "resource_id": resource_id,
                        "batch_id": batch_id,
                    }
                )
            raise BatchCancelled(batch_id)

    # Initialize a batch counter in Redis. For each resource_id, it sets
    # the number of produced records
    counter.set(f"{batch_id}:{resource_id}", count)
    logger.info(
        {
            "message": f"Batch {batch_id} size is {count} for resource type {analysis.definition_id}",
            "resource_id": resource_id,
        },
    )


def batch_resource_handler(
    event: events.BatchResource,
    publisher: EventPublisher,
    counter: DecrementingCounter,
    analyzer: Analyzer,
    cache: CacheBackend,
):
    # Get mapping from cache or from DB
    mappings = cache.get(f"{event.batch_id}.{event.resource_id}")
    if mappings is None:
        mappings = models.Batch.objects.get(id=event.batch_id).mappings
    mapping = as_old_mapping(Source(**mappings), event.resource_id)

    analysis = analyzer.load_cached_analysis(event.batch_id, event.resource_id, mapping)
    db_connection = DBConnection(analysis.source_credentials)
    extractor = Extractor(db_connection)
    query = extractor.extract(analysis, event.primary_key_values)
    broadcast_events(query, analysis, publisher, counter, event.batch_id)


def bootstrap(
    subscriber=KafkaEventSubscriber(group_id="extractor"),
    cache=RedisCacheBackend(),
    counter=RedisDecrementingCounter(),
    publisher=KafkaEventPublisher(),
) -> Service:
    analyzer = Analyzer()

    handlers = {
        "^batch\\..*": lambda raw: batch_resource_handler(
            event=events.BatchResource(**raw),
            publisher=publisher,
            counter=counter,
            analyzer=analyzer,
            cache=cache,
        )
    }

    return Service(subscriber, handlers)
