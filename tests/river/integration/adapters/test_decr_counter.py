import pytest

from river.adapters.decr_counter import RedisDecrementingCounter


@pytest.mark.redis
def test_can_decr_counter():
    counter = RedisDecrementingCounter()

    counter.set("foo", 10)
    assert counter.get("foo") == 10
    counter.decr("foo")
    assert counter.get("foo") == 9
