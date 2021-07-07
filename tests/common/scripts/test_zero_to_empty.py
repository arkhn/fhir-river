from common.scripts import zero_to_empty


def test_zero_to_empty():
    assert zero_to_empty("0") is None
