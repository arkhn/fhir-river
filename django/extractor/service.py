import logging

from confluent_kafka import KafkaError, KafkaException

from common.analyzer import Analyzer
from common.database_connection.db_connection import DBConnection
from common.service.service import Service
from extractor.conf import conf
from extractor.extract import Extractor
from river.adapters.decr_counter import DecrementingCounter, RedisDecrementingCounter
from river.adapters.event_publisher import EventPublisher, KafkaEventPublisher
from river.adapters.event_subscriber import KafkaEventSubscriber
from river.adapters.mappings import MappingsRepository, RedisMappingsRepository
from river.domain import events

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
            publisher.publish(topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}", event=event)
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
    counter.set(f"{batch_id}:{resource_id}", count)
    logger.info(
        {
            "message": f"Batch {batch_id} size is {count} for resource type {analysis.definition_id}",
            "resource_id": resource_id,
        },
    )


def batch_resource_handler(
    event: events.BatchEvent,
    publisher: EventPublisher,
    counter: DecrementingCounter,
    analyzer: Analyzer,
    mappings_repo: MappingsRepository,
):
    mapping = mappings_repo.get(event.batch_id, event.resource_id)
    analysis = analyzer.load_cached_analysis(event.batch_id, event.resource_id, mapping)
    db_connection = DBConnection(analysis.source_credentials)
    with db_connection.session_scope() as session:
        extractor = Extractor(session, db_connection.metadata)
        query = extractor.extract(analysis, event.primary_key_values)
        broadcast_events(query, analysis, publisher, counter, event.batch_id)


def bootstrap(
    subscriber=KafkaEventSubscriber(group_id=conf.CONSUMER_GROUP_ID),
    mappings_repo=RedisMappingsRepository(),
    counter=RedisDecrementingCounter(),
    publisher=KafkaEventPublisher(),
) -> Service:
    analyzer = Analyzer()

    handlers = {
        "^batch\\..*": lambda raw: batch_resource_handler(
            event=events.BatchEvent(**raw),
            publisher=publisher,
            counter=counter,
            analyzer=analyzer,
            mappings_repo=mappings_repo,
        )
    }

    return Service(subscriber, handlers)
