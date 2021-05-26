from utils.caching import cache


def test_can_cache():
    execution_counter = 0

    @cache("first_param", backend="memory")
    def func(first_param: int):
        nonlocal execution_counter
        execution_counter += 1
        return first_param * 2

    assert func(2) == 4
    assert execution_counter == 1
    assert func(2) == 4
    assert execution_counter == 1
    assert func(3) == 6
    assert execution_counter == 2
