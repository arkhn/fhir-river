from common.scripts import utils


def test_min():
    assert utils.select_min(1, 2, 3) == 1
    assert utils.select_min("a", "b", "ab") == "a"
