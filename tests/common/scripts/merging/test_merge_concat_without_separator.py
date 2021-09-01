import datetime

from common.scripts.merging import merge_concat_without_separator


def test_merge_concat_without_separator():

    # Tests string

    assert merge_concat_without_separator("1") == "1"

    assert merge_concat_without_separator("1", "2") == "12"

    assert merge_concat_without_separator("1", "2", "3") == "123"

    assert merge_concat_without_separator("a", "b", "ab") == "abab"

    # Tests integer

    assert merge_concat_without_separator(1, 2) == "12"

    assert merge_concat_without_separator(1, 2, 3) == "123"

    # Tests datetime

    dateNow = datetime.datetime.now()
    assert merge_concat_without_separator("a", dateNow) == "a" + str(dateNow)

    assert (
        merge_concat_without_separator("testing", datetime.datetime(2020, 5, 17))
        == "testing2020-05-17 00:00:00"
    )
    # Test date

    assert (
        merge_concat_without_separator("testing", datetime.date(2020, 5, 17)) == "testing2020-05-17"
    )

    # Test boolean

    assert merge_concat_without_separator(True) == "True"

    assert merge_concat_without_separator(True, False) == "TrueFalse"

    # Test mixed
    dateNow = datetime.datetime.now()
    assert (
        merge_concat_without_separator("a", dateNow, datetime.date(2020, 5, 17), True)
        == "a" + str(dateNow) + "2020-05-17True"
    )
