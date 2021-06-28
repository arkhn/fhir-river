import logging
from time import sleep

from django.utils import timezone

from river import models
from river.adapters.progression_counter import ProgressionCounter, RedisProgressionCounter
from river.adapters.topics import KafkaTopics, TopicsHandler

logger = logging.getLogger(__name__)


def teardown_after_batch(batch: models.Batch, topics: TopicsHandler):
    for base_topic in ["batch", "extract", "transform", "load"]:
        topics.delete(f"{base_topic}.{batch.id}")

    # FIXME: do we actually care about redis ?


def clean(counter: ProgressionCounter, topics: TopicsHandler):
    current_batches = models.Batch.objects.filter(deleted_at__isnull=True)
    batches_to_delete = []

    for batch in current_batches:
        resources_counters = [counter.get(f"{batch.id}.{resource_id}") for resource_id in batch.resources]
        if all(
            [
                counter_extracted is not None and counter_loaded is not None and counter_loaded >= counter_extracted
                for counter_extracted, counter_loaded in resources_counters
            ]
        ):
            batches_to_delete.append(batch)

    logger.info(f"Deleting batches: {batches_to_delete}.")

    for batch in batches_to_delete:
        teardown_after_batch(batch, topics)
        batch.deleted_at = timezone.now()
        batch.save()
        logger.info(f"Batch {batch} deleted.")


def run(counter=RedisProgressionCounter(), topics=KafkaTopics):
    while True:
        clean(counter=counter, topics=topics)
        sleep(1)
