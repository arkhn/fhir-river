import pytest

from river.adapters.decr_counter import FakeDecrementingCounter
from river.adapters.topics import FakeTopics
from topicleaner.service import clean

pytestmark = pytest.mark.django_db


def test_done_batch_is_cleaned(batch):
    counters = FakeDecrementingCounter(counts={f"{batch.id}.{resource_id}": 0 for resource_id in batch.resources})
    topics = FakeTopics(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics == set()


def test_ongoing_batch_is_not_cleaned(batch):
    counters = FakeDecrementingCounter(counts={f"{batch.id}.{resource_id}": 1 for resource_id in batch.resources})
    topics = FakeTopics(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics != set()


def test_missing_counter_prevents_cleaning(batch):
    counters = FakeDecrementingCounter(counts={f"{batch.id}.{resource_id}": 0 for resource_id in batch.resources[1:]})
    topics = FakeTopics(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics != set()
