import logging
from time import sleep
from typing import List

from django.utils import timezone

from river.adapters.progression_counter import ProgressionCounter
from river.adapters.topics import TopicsManager
from river.models import Batch

logger = logging.getLogger(__name__)


def teardown_after_batch(batch: Batch, topics: TopicsManager):
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics.delete(f"{base_topic}.{batch.id}")

    # FIXME: do we actually care about redis ?


def clean(counter: ProgressionCounter, topics: TopicsManager):
    current_batches = Batch.objects.filter(completed_at__isnull=True, canceled_at__isnull=True)
    batches_to_delete: List[Batch] = []

    for batch in current_batches:
        resources_progressions = [counter.get(f"{batch.id}:{resource_id}") for resource_id in batch.resource_ids]

        if all(
            [
                progression is not None
                and progression.extracted is not None
                and ((progression.loaded or 0) + (progression.failed or 0)) >= progression.extracted
                for progression in resources_progressions
            ]
        ):
            batches_to_delete.append(batch)

    if batches_to_delete:
        logger.info(f"Deleting batches: {batches_to_delete}.")

    for batch in batches_to_delete:
        teardown_after_batch(batch, topics)
        batch.completed_at = timezone.now()
        batch.save()
        logger.info(f"Batch {batch} deleted.")


def run(counter: ProgressionCounter, topics: TopicsManager):
    while True:
        clean(counter=counter, topics=topics)
        sleep(10)
