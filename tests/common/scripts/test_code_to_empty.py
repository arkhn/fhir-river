from common.scripts import code_to_empty


def test_code_to_empty():
    assert code_to_empty("-1") is None
    assert code_to_empty("(sans)") is None
    assert code_to_empty("-2") is not None
