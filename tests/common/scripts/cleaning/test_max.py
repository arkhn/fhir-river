from common.scripts import utils


def test_max():
    assert utils.select_max(1, 2, 3) == 3
    assert utils.select_max("a", "b", "ab") == "b"
