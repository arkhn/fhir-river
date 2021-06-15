import logging

from confluent_kafka import KafkaError, KafkaException

from common.analyzer import Analyzer
from common.errors import OperationOutcome
from common.service.service import Service
from river.adapters.event_publisher import EventPublisher, KafkaEventPublisher
from river.adapters.event_subscriber import KafkaEventSubscriber
from river.adapters.mappings import APIMappingsRepository, MappingsRepository
from river.domain import events
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
    mappings_repo: MappingsRepository,
):
    mapping = mappings_repo.get(event.resource_id)
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
    mappings_repo=APIMappingsRepository(),
    publisher=KafkaEventPublisher(),
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
            mappings_repo=mappings_repo,
        )
    }

    return Service(subscriber, handlers)
