import pytest

from river.adapters.progression_counter import RedisProgressionCounter


@pytest.mark.redis
def test_can_decr_counter():
    counter = RedisProgressionCounter()

    counter.set_extracted("foo", 10)
    assert counter.get("foo") == (10, None)

    counter.increment_loaded("foo")
    assert counter.get("foo") == (10, 1)

    for _ in range(5):
        counter.increment_loaded("foo")
    assert counter.get("foo") == (10, 6)
