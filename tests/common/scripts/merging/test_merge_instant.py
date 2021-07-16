from common.scripts.merging import merge_instant
import pytest


def test_merge_instant():
    assert merge_instant("2015-02-07", "13:28:17") == "2015-02-07T13:28:17+02:00"

    with pytest.raises(ValueError) as exc_info:
        merge_instant("11111", "2222", "3333")

    assert exc_info.type is ValueError

    with pytest.raises(ValueError) as exc_info:
        merge_instant()

    assert exc_info.type is ValueError
