import json
from typing import Any, List, Optional, Tuple

from django.utils import timezone

from fhir.resources import construct_fhir_element

from pydantic import ValidationError
from river import models
from river.adapters.event_publisher import EventPublisher
from river.adapters.pyrog_client import PyrogClient
from river.adapters.topics import TopicsManager
from river.common.analyzer import Analyzer
from river.common.database_connection.db_connection import DBConnection
from river.domain.events import BatchEvent
from river.extractor.extractor import Extractor
from river.transformer.transformer import Transformer
from utils.json import CustomJSONEncoder


def build_mappings(
    mappings,
    # FIXME remove this when the DB is shared
    pyrog_client: PyrogClient,
):
    for resource_id in mappings.keys():
        if mappings[resource_id]:
            continue
        mappings[resource_id] = pyrog_client.fetch_mapping(resource_id)


def batch(
    batch_instance: models.Batch,
    mappings: dict,
    topics_manager: TopicsManager,
    publisher: EventPublisher,
):
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics_manager.create(f"{base_topic}.{batch_instance.id}")

    for resource_id in mappings.keys():
        publisher.publish(
            topic=f"batch.{batch_instance.id}",
            event=BatchEvent(batch_id=batch_instance.id, resource_id=resource_id),
        )


def abort(batch: models.Batch, topics_manager: TopicsManager) -> None:
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics_manager.delete(f"{base_topic}.{batch.id}")

    batch.deleted_at = timezone.now()
    batch.save(update_fields=["deleted_at"])


def retry(batch: models.Batch) -> None:
    pass


def preview(
    resource_id: str, primary_key_values: Optional[list], pyrog_client: PyrogClient
) -> Tuple[List[Any], List[Any]]:
    resource_mapping = pyrog_client.fetch_mapping(resource_id)

    analyzer = Analyzer()
    analysis = analyzer.analyze(resource_mapping)

    db_connection = DBConnection(analysis.source_credentials)
    with db_connection.session_scope() as session:
        extractor = Extractor(session, db_connection.metadata)
        df = extractor.extract(analysis, primary_key_values)

        transformer = Transformer()

        documents = []
        errors = []

        for row in extractor.split_dataframe(df, analysis):
            # Encode and decode the row to mimic what happens when events are serialized
            # to pass through kafka
            row = json.JSONDecoder().decode(CustomJSONEncoder().encode(row))
            primary_key_value = row[analysis.primary_key_column.dataframe_column_name()][0]
            transformed_data = transformer.transform_data(row, analysis, primary_key_value)
            document = transformer.create_fhir_document(transformed_data, analysis, primary_key_value)
            documents.append(document)
            resource_type = document.get("resourceType")
            try:
                construct_fhir_element(resource_type, document)
            except ValidationError as e:
                errors.extend(
                    [
                        f"{err['msg'] or 'Validation error'}: "
                        f"{e.model.get_resource_type()}.{'.'.join([str(l) for l in err['loc']])}"
                        for err in e.errors()
                    ]
                )

    return documents, errors
