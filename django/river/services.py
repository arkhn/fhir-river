import json
from typing import Any, List, Optional, Tuple

from django.utils import timezone

from fhir.resources import construct_fhir_element

from pydantic import ValidationError
from river import models
from river.adapters.event_publisher import EventPublisher
from river.adapters.topics import TopicsHandler
from river.common.analyzer import Analyzer
from river.common.database_connection.db_connection import DBConnection
from river.domain.events import BatchResource
from river.extractor.extractor import Extractor
from river.transformer.transformer import Transformer
from utils.caching import CacheBackend
from utils.json import CustomJSONEncoder


def batch(
    mappings: List[Any], topics: TopicsHandler, publisher: EventPublisher, cache: CacheBackend = None
) -> models.Batch:
    batch_instance = models.Batch.objects.create(mappings=mappings)

    for base_topic in ["batch", "extract", "transform", "load"]:
        topics.create(f"{base_topic}.{batch_instance.id}")

    for mapping in mappings:
        if cache:
            cache.set(f"{batch_instance.id}.{mapping['id']}", mapping)

        publisher.publish(
            topic=f"batch.{batch_instance.id}",
            event=BatchResource(batch_id=batch_instance.id, resource_id=mapping["id"]),
        )

    return batch_instance


def abort(batch: models.Batch, topics: TopicsHandler) -> None:
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics.delete(f"{base_topic}.{batch.id}")

    batch.deleted_at = timezone.now()
    batch.save(update_fields=["deleted_at"])

    # FIXME: invalidate the cache


def retry(batch: models.Batch) -> None:
    pass


def preview(mapping: Any, primary_key_values: Optional[list]) -> Tuple[List[Any], List[Any]]:
    analyzer = Analyzer()
    analysis = analyzer.analyze(mapping)

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
