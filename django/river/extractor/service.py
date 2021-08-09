import logging

from confluent_kafka import KafkaError, KafkaException

from river.adapters.event_publisher import EventPublisher
from river.adapters.event_subscriber import EventSubscriber
from river.adapters.mappings import MappingsRepository
from river.adapters.progression_counter import ProgressionCounter
from river.common.analyzer import Analyzer
from river.common.database_connection.db_connection import DBConnection
from river.common.service.errors import BatchCancelled
from river.common.service.service import Service
from river.domain import events
from river.extractor.extractor import Extractor

logger = logging.getLogger(__name__)


def broadcast_events(
    dataframe,
    analysis,
    publisher: EventPublisher,
    counter: ProgressionCounter,
    batch_id=None,
):
    resource_type = analysis.definition_id
    resource_id = analysis.resource_id
    count = 0
    list_records_from_db = Extractor.split_dataframe(dataframe, analysis)
    for record in list_records_from_db:
        try:
            logger.debug(
                {
                    "message": "One record from extract",
                    "batch_id": batch_id,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "record": record,
                },
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
    counter.set_extracted(f"{batch_id}:{resource_id}", count)
    logger.info(
        {
            "message": f"Batch {batch_id} size is {count} for resource type {analysis.definition_id}",
            "resource_id": resource_id,
        },
    )


def batch_resource_handler(
    event: events.BatchEvent,
    publisher: EventPublisher,
    counter: ProgressionCounter,
    analyzer: Analyzer,
    mappings_repo: MappingsRepository,
):
    mapping = mappings_repo.get(event.batch_id, event.resource_id)
    analysis = analyzer.analyze(mapping)
    db_connection = DBConnection(analysis.source_credentials)
    with db_connection.session_scope() as session:
        extractor = Extractor(session, db_connection.metadata)
        query = extractor.extract(analysis)
        broadcast_events(query, analysis, publisher, counter, event.batch_id)


def bootstrap(
    subscriber: EventSubscriber,
    publisher: EventPublisher,
    mappings_repo: MappingsRepository,
    counter: ProgressionCounter,
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
