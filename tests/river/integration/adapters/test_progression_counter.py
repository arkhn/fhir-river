import pytest

from river.adapters.progression_counter import Progression, RedisProgressionCounter


@pytest.mark.redis
def test_progression_counter():
    counter = RedisProgressionCounter()

    counter.set_extracted("foo", 10)
    assert counter.get("foo") == Progression(extracted=10, loaded=None)

    counter.increment_loaded("foo")
    assert counter.get("foo") == Progression(extracted=10, loaded=1)

    for _ in range(5):
        counter.increment_loaded("foo")
    assert counter.get("foo") == Progression(extracted=10, loaded=6)
