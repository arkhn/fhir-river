from datetime import datetime
from typing import List

from river import models
from river.adapters.event_publisher import EventPublisher
from river.adapters.mappings import MappingsRepository
from river.adapters.topics import TopicsHandler
from river.domain.events import BatchEvent


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
            event=BatchEvent(batch_id=batch_instance.id, resource_id=resource_id),
        )

    return batch_instance


def abort(batch: models.Batch, topics: TopicsHandler) -> None:
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics.delete(f"{base_topic}.{batch.id}")

    batch.deleted_at = datetime.now()
    batch.save(update_fields=["deleted_at"])


def retry(batch: models.Batch) -> None:
    pass
