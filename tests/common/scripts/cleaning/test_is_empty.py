from common.scripts import utils


def test_is_empty():
    assert utils.is_empty(None)
    assert utils.is_empty("NaN")
    assert utils.is_empty("")
    assert utils.is_empty("  ")
    assert not utils.is_empty(" holà   ")
