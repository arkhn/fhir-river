import datetime

import pytest

from common.scripts.merging import merge_concat, merge_concat_without_separator

datenow = datetime.datetime.now()


@pytest.mark.parametrize(
    "test_input,expected",
    [(("a", datenow), f"a{datenow}"), (("testing", datetime.date(2020, 5, 17)), "testing2020-05-17")],
)
def test_merge_concat_without_separator_date(test_input, expected):
    assert merge_concat_without_separator(*test_input) == expected


@pytest.mark.parametrize(
    "test_input,expected",
    [(("a", datenow), f"a {datenow}"), (("testing", datetime.date(2020, 5, 17)), "testing 2020-05-17")],
)
def test_merge_concat_date(test_input, expected):
    assert merge_concat(*test_input) == expected
