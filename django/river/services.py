import json
from typing import Any, List, Optional, Tuple

from django.utils import timezone

from common.adapters.fhir_api import fhir_api
from pyrog.models import Resource
from river import models
from river.adapters.event_publisher import EventPublisher
from river.adapters.progression_counter import ProgressionCounter
from river.adapters.topics import TopicsManager
from river.common.analyzer import Analyzer
from river.common.database_connection.db_connection import DBConnection
from river.domain.events import BatchEvent
from river.extractor.extractor import Extractor
from river.transformer.transformer import Transformer
from utils.json import CustomJSONEncoder


def batch(
    batch_id: str,
    resources: List[Resource],
    topics_manager: TopicsManager,
    publisher: EventPublisher,
):
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics_manager.create(f"{base_topic}.{batch_id}")

    for resource in resources:
        publisher.publish(
            topic=f"batch.{batch_id}",
            event=BatchEvent(batch_id=batch_id, resource_id=resource.id),
        )


def abort(batch: models.Batch, topics_manager: TopicsManager, counter: ProgressionCounter) -> None:
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics_manager.delete(f"{base_topic}.{batch.id}")

    # Persist progressions in DB
    for resource in batch.resources.all():
        resource_progression = counter.get(f"{batch.id}:{resource.id}")
        if not resource_progression:
            continue
        models.Progression.objects.create(
            batch=batch,
            resource=resource,
            extracted=resource_progression.extracted,
            loaded=resource_progression.loaded,
            failed=resource_progression.failed,
        )

    batch.canceled_at = timezone.now()
    batch.save()


def retry(batch: models.Batch) -> None:
    pass


def preview(
    mapping: dict, resource_id: str, primary_key_values: Optional[list], fhir_api_auth_token: str
) -> Tuple[List[Any], List[Any]]:
    analyzer = Analyzer()
    analysis = analyzer.analyze(resource_id, mapping)

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
            validation_response = fhir_api.validate(resource_type, document, fhir_api_auth_token)
            errors.extend(validation_response.get("issue"))

    return documents, errors
