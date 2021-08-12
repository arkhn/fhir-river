import pytest

from common.scripts.cleaning import clean_epoch_dateTime


@pytest.mark.parametrize(
    "test_input,expected",
    [
        ("40246871", "1971-04-11T20:41:11+02:00"),
        ("1330063200000", "2012-02-24T07:00:00+02:00"),
        ("1330695360000", "2012-03-02T14:36:00+02:00"),
    ],
)
def test_clean_epoch_dateTime(test_input, expected):
    output = clean_epoch_dateTime(test_input)
    assert output == expected
