import pytest

from river.adapters.decr_counter import FakeDecrementingCounter
from river.adapters.topics import FakeTopics
from river.topicleaner.service import clean

pytestmark = pytest.mark.django_db


def test_done_batch_is_cleaned(batch):
    counters = FakeDecrementingCounter(counts={f"{batch.id}.{mapping['id']}": 0 for mapping in batch.mappings})
    topics = FakeTopics(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics == set()


def test_ongoing_batch_is_not_cleaned(batch):
    counters = FakeDecrementingCounter(counts={f"{batch.id}.{mapping['id']}": 1 for mapping in batch.mappings})
    topics = FakeTopics(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics != set()


def test_missing_counter_prevents_cleaning(batch):
    counters = FakeDecrementingCounter(counts={f"{batch.id}.{mapping['id']}": 0 for mapping in batch.mappings[1:]})
    topics = FakeTopics(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics != set()
