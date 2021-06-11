from datetime import timedelta
from time import sleep
from uuid import uuid4

import pytest

from utils.caching import cache


def test_caching_with_decorator():
    execution_counter = 0

    @cache("first_param", backend="memory")
    def func(first_param: int) -> int:
        nonlocal execution_counter
        execution_counter += 1
        return first_param * 2

    assert func(2) == 4
    assert execution_counter == 1
    assert func(2) == 4
    assert execution_counter == 1
    assert func(3) == 6
    assert execution_counter == 2


@pytest.mark.redis
def test_cache_can_expire():
    execution_counter = 0

    random_input = str(uuid4())

    @cache("first_param", backend="redis", expire_after=timedelta(milliseconds=50))
    def func(first_param: str) -> str:
        nonlocal execution_counter
        execution_counter += 1
        return first_param * 2

    assert func(random_input) == random_input * 2
    assert execution_counter == 1
    assert func(random_input) == random_input * 2
    assert execution_counter == 1

    sleep(0.1)

    assert func(random_input) == random_input * 2
    assert execution_counter == 2
