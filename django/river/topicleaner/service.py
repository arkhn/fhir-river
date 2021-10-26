import logging
from time import sleep

from django.utils import timezone

from river import models
from river.adapters.progression_counter import ProgressionCounter
from river.adapters.topics import TopicsManager
from river.models import Batch

logger = logging.getLogger(__name__)


def teardown_after_batch(batch: Batch, topics: TopicsManager):
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics.delete(f"{base_topic}.{batch.id}")


def clean(counter: ProgressionCounter, topics: TopicsManager):
    current_batches = Batch.objects.filter(completed_at__isnull=True, canceled_at__isnull=True).prefetch_related(
        "resources"
    )

    for batch in current_batches:
        resources_progressions = {
            resource: counter.get(f"{batch.id}:{resource.id}") for resource in batch.resources.all()
        }

        if all(
            [
                progression is not None
                and progression.extracted is not None
                and ((progression.loaded or 0) + (progression.failed or 0)) >= progression.extracted
                for progression in resources_progressions.values()
            ]
        ):
            logger.info(f"Deleting batch {batch}.")

            for resource, progression in resources_progressions.items():
                if not progression:
                    continue
                models.Progression.objects.create(
                    batch=batch,
                    resource=resource,
                    extracted=progression.extracted,
                    loaded=progression.loaded,
                    failed=progression.failed,
                )

            teardown_after_batch(batch, topics)
            batch.completed_at = timezone.now()
            batch.save()

            logger.info(f"Batch {batch} deleted.")


def run(counter: ProgressionCounter, topics: TopicsManager):
    while True:
        clean(counter=counter, topics=topics)
        sleep(10)
