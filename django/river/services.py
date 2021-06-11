import json
from typing import Any, List, Optional, Tuple

from django.utils import timezone

from fhir.resources import construct_fhir_element

from common.analyzer import Analyzer
from common.database_connection.db_connection import DBConnection
from extractor.extract import Extractor
from pydantic import ValidationError
from river import models
from river.adapters.event_publisher import EventPublisher
from river.adapters.mappings import MappingsRepository
from river.adapters.topics import TopicsHandler
from river.domain.events import BatchResource
from transformer.transform import Transformer
from utils.json import CustomJSONEncoder


def batch(
    resources: List[str], topics: TopicsHandler, publisher: EventPublisher, mappings: MappingsRepository
) -> models.Batch:
    batch_instance = models.Batch.objects.create()

    for base_topic in ["batch", "extract", "transform", "load"]:
        topics.create(f"{base_topic}.{batch_instance.id}")

    for resource_id in resources:
        # Ensure the mapping exists
        mappings.get(resource_id)

        publisher.publish(
            topic=f"batch.{batch_instance.id}",
            event=BatchResource(batch_id=batch_instance.id, resource_id=resource_id),
        )

    return batch_instance


def abort(batch: models.Batch, topics: TopicsHandler) -> None:
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics.delete(f"{base_topic}.{batch.id}")

    batch.deleted_at = timezone.now()
    batch.save(update_fields=["deleted_at"])


def retry(batch: models.Batch) -> None:
    pass


def preview(
    resource_id: str, primary_key_values: Optional[list], mappings: MappingsRepository
) -> Tuple[List[Any], List[Any]]:
    resource_mapping = mappings.get(resource_id)

    analyzer = Analyzer()
    analysis = analyzer.analyze(resource_mapping)

    db_connection = DBConnection(analysis.source_credentials)
    extractor = Extractor(db_connection)
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
