from common.scripts.merging import merge_datetime


def test_merge_datetime():
    assert merge_datetime("2015-02-07", "13:28:17") == "2015-02-07T13:28:17+02:00"
