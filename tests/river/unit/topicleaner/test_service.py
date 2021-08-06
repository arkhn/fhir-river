import pytest

from river.adapters.progression_counter import FakeProgressionCounter
from river.adapters.topics import FakeTopicsManager
from river.topicleaner.service import clean

pytestmark = pytest.mark.django_db


def test_done_batch_is_cleaned(batch):
    counters = FakeProgressionCounter(
        counts={
            f"{batch.id}:{resource['id']}": {"extracted": 10, "loaded": 10} for resource in batch.mappings["resources"]
        }
    )
    topics = FakeTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics == set()


def test_done_batch_is_cleaned_with_failed(batch):
    counters = FakeProgressionCounter(
        counts={
            f"{batch.id}:{resource['id']}": {"extracted": 10, "loaded": 6, "failed": 4}
            for resource in batch.mappings["resources"]
        }
    )
    topics = FakeTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )
    clean(counters, topics)

    assert topics._topics == set()


def test_ongoing_batch_is_not_cleaned(batch):
    counters = FakeProgressionCounter(
        counts={
            f"{batch.id}:{resource['id']}": {"extracted": 10, "loaded": 9} for resource in batch.mappings["resources"]
        }
    )
    topics = FakeTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics != set()


def test_ongoing_batch_is_not_cleaned_with_failed(batch):
    counters = FakeProgressionCounter(
        counts={
            f"{batch.id}:{resource['id']}": {"extracted": 10, "loaded": 6, "failed": 2}
            for resource in batch.mappings["resources"]
        }
    )
    topics = FakeTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics != set()


def test_none_counter_prevents_cleaning(batch):
    counters = FakeProgressionCounter(
        counts={
            f"{batch.id}:{resource['id']}": {"extracted": None, "loaded": 10}
            for resource in batch.mappings["resources"]
        }
    )
    topics = FakeTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics != set()


def test_missing_counter_prevents_cleaning(batch):
    counters = FakeProgressionCounter(
        counts={
            f"{batch.id}:{resource['id']}": {"extracted": 10, "loaded": 10}
            for resource in batch.mappings["resources"][1:]
        }
    )
    topics = FakeTopicsManager(
        topics=[f"{base_topic}.{batch.id}" for base_topic in ["batch", "extract", "transform", "load"]]
    )

    clean(counters, topics)

    assert topics._topics != set()
