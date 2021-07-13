from common.scripts.merging import merge_instant


def test_merge_instant():
    assert merge_instant("2015-02-07", "13:28:17") == "2015-02-07T13:28:17+02:00"
