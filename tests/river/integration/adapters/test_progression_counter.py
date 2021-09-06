import pytest

from river.adapters.progression_counter import Progression, RedisProgressionCounter


@pytest.mark.redis
def test_progression_counter():
    counter = RedisProgressionCounter()

    counter.set_extracted("foo", 10)
    assert counter.get("foo") == Progression(extracted=10, loaded=None, failed=None)

    counter.increment_loaded("foo")
    assert counter.get("foo") == Progression(extracted=10, loaded=1, failed=None)

    counter.increment_failed("foo")
    assert counter.get("foo") == Progression(extracted=10, loaded=1, failed=1)

    for _ in range(4):
        counter.increment_loaded("foo")
        counter.increment_failed("foo")
    assert counter.get("foo") == Progression(extracted=10, loaded=5, failed=5)
