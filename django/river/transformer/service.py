import logging

from confluent_kafka import KafkaError, KafkaException

from river import models
from river.adapters.event_publisher import EventPublisher, KafkaEventPublisher
from river.adapters.event_subscriber import KafkaEventSubscriber
from river.common.analyzer import Analyzer
from river.common.errors import OperationOutcome
from river.common.service.service import Service
from river.domain import events
from river.parsing import Source, as_old_mapping
from river.transformer.reference_binder import ReferenceBinder
from river.transformer.transformer import Transformer
from utils.caching import CacheBackend, RedisCacheBackend

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
        logger.exception(
            {"message": str(e), **logging_extras},
        )
        raise OperationOutcome(f"Failed to transform {row}:\n{e}") from e


def extracted_record_handler(
    event: events.ExtractedRecord,
    publisher: EventPublisher,
    analyzer: Analyzer,
    transformer: Transformer,
    binder: ReferenceBinder,
    cache: CacheBackend,
):
    mappings = cache.get(f"{event.batch_id}.{event.resource_id}")
    if mappings is None:
        mappings = models.Batch.objects.get(id=event.batch_id).mappings
    mapping = as_old_mapping(Source(**mappings), event.resource_id)

    analysis = analyzer.load_cached_analysis(event.batch_id, event.resource_id, mapping)
    fhir_object = transform_row(analysis, event.record, transformer=transformer)

    # Resolve references
    logger.debug(
        {
            "message": f"Resolving references {analysis.reference_paths} for resource {fhir_object['id']}",
            "batch_id": event.batch_id,
            "resource_id": event.resource_id,
            "label": analysis.label,
            "definition_id": analysis.definition_id,
        },
    )
    resolved_fhir_instance = binder.resolve_references(fhir_object, analysis.reference_paths)

    try:
        outgoing_event = events.TransformedRecord(
            batch_id=event.batch_id,
            resource_id=event.resource_id,
            fhir_object=resolved_fhir_instance,
        )
        publisher.publish(
            topic=f"transform.{event.batch_id}",
            event=outgoing_event,
        )
    except KafkaException as err:
        if err.args[0].code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
            logger.warning(
                {
                    "message": "The current batch has been cancelled",
                    "resource_id": event.resource_id,
                    "batch_id": event.batch_id,
                }
            )


def bootstrap(
    subscriber=KafkaEventSubscriber(group_id="transformer"),
    publisher=KafkaEventPublisher(),
    cache=RedisCacheBackend(),
) -> Service:
    analyzer = Analyzer()
    transformer = Transformer()
    binder = ReferenceBinder()

    handlers = {
        "^extract\\..*": lambda raw: extracted_record_handler(
            event=events.ExtractedRecord(**raw),
            publisher=publisher,
            analyzer=analyzer,
            transformer=transformer,
            binder=binder,
            cache=cache,
        )
    }

    return Service(subscriber, handlers)