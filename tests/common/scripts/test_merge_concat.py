import datetime

from common.scripts import merge_concat


def test_merge_concat():

    # Tests string

    assert merge_concat("1") == "1"

    assert merge_concat("1", "2") == "1 2"

    assert merge_concat("1", "2", "3") == "1 2 3"

    assert merge_concat("a", "b", "ab") == "a b ab"

    # Tests integer

    assert merge_concat(1, 2) == "1 2"

    assert merge_concat(1, 2, 3) == "1 2 3"

    # Tests datetime

    dateNow = datetime.datetime.now()
    assert merge_concat("a", dateNow) == "a " + str(dateNow)

    assert merge_concat("testing", datetime.datetime(2020, 5, 17)) == "testing 2020-05-17 00:00:00"
    # Test date

    assert merge_concat("testing", datetime.date(2020, 5, 17)) == "testing 2020-05-17"

    # Test boolean

    assert merge_concat(True) == "True"

    assert merge_concat(True, False) == "True False"

    # Test mixed
    dateNow = datetime.datetime.now()
    assert merge_concat("a", dateNow, datetime.date(2020, 5, 17), True) == "a " + str(dateNow) + " 2020-05-17 True"
