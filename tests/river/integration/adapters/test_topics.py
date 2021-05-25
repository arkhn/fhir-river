import pytest

import tenacity
from river.adapters.topics import KafkaTopics

pytestmark = pytest.mark.kafka


def test_topics_can_create_and_delete_topic():
    topics = KafkaTopics()

    topics.create("foo")

    # Asserts that the topic has been created by trying to recreate it
    # That way the internal implementation does not leak into our tests
    with pytest.raises(Exception):
        topics.create("foo")

    # Deletion can fail if creation is not yet done
    for attempt in tenacity.Retrying(
        stop=tenacity.stop_after_delay(3), wait=tenacity.wait.wait_fixed(1), reraise=True
    ):
        with attempt:
            topics.delete("foo")

    # Asserts that the topic has been deleted by trying to redelete it
    with pytest.raises(Exception):
        # Re-deletion can succeed if the first deletion is not yet done
        for attempt in tenacity.Retrying(
            retry=tenacity.retry.retry_unless_exception_type(Exception),
            stop=tenacity.stop_after_delay(3),
            wait=tenacity.wait.wait_fixed(1),
            reraise=True,
        ):
            with attempt:
                topics.delete("foo")
