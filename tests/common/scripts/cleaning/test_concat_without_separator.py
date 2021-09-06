import datetime

from common.scripts import utils


def test_concat_without_separator():

    # Tests string

    assert utils.concat_without_separator("1") == "1"

    assert utils.concat_without_separator("1", "2") == "12"

    assert utils.concat_without_separator("1", "2", "3") == "123"

    assert utils.concat_without_separator("a", "b", "ab") == "abab"

    assert utils.concat_without_separator("a   ", " b", "  ab") == "a    b  ab"

    assert (
        utils.concat_without_separator("Pyrog      ", " Is         ", "  Awesome ")
        == "Pyrog       Is           Awesome "
    )

    # Tests integer

    assert utils.concat_without_separator(1, 2) == "12"

    assert utils.concat_without_separator(1, 2, 3) == "123"

    # Tests datetime

    dateNow = datetime.datetime.now()
    assert utils.concat_without_separator("a", dateNow) == "a" + str(dateNow)

    assert utils.concat_without_separator("testing", datetime.datetime(2020, 5, 17)) == "testing2020-05-17 00:00:00"

    # Test date

    assert utils.concat_without_separator("testing", datetime.date(2020, 5, 17)) == "testing2020-05-17"

    # Test boolean

    assert utils.concat_without_separator(True) == "True"

    assert utils.concat_without_separator(True, False) == "TrueFalse"

    # Test mixed
    dateNow = datetime.datetime.now()
    assert (
        utils.concat_without_separator("a", dateNow, datetime.date(2020, 5, 17), True)
        == "a" + str(dateNow) + "2020-05-17True"
    )
