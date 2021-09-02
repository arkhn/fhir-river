import datetime

import pytest

from common.scripts.merging import merge_concat, merge_concat_without_separator

datenow = datetime.datetime.now()


@pytest.mark.parametrize(
    "test_input,expected", [(("a", datenow, datetime.date(2020, 5, 17), True), f"a{datenow}2020-05-17True")]
)
def test_merge_concat_without_separator_mix(test_input, expected):
    assert merge_concat_without_separator(*test_input) == expected


@pytest.mark.parametrize(
    "test_input,expected", [(("a", datenow, datetime.date(2020, 5, 17), True), f"a {datenow} 2020-05-17 True")]
)
def test_merge_concat_mix(test_input, expected):
    assert merge_concat(*test_input) == expected
