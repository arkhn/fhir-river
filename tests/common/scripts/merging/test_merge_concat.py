import datetime

import pytest

from common.scripts.merging import merge_concat, merge_concat_without_separator

datenow = datetime.datetime.now()

# Boolean


@pytest.mark.parametrize("test_input,expected", [((True,), "True"), ((True, False), "TrueFalse")])
def test_merge_concat_without_separator_bool(test_input, expected):
    assert merge_concat_without_separator(*test_input) == expected


@pytest.mark.parametrize("test_input,expected", [((True,), "True"), ((True, False), "True False")])
def test_merge_concat_bool(test_input, expected):
    assert merge_concat(*test_input) == expected


# Date


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


# Integer
@pytest.mark.parametrize("test_input,expected", [((1, 2), "12"), ((1, 2, 3), "123")])
def test_merge_concat_without_separator_int(test_input, expected):
    assert merge_concat_without_separator(*test_input) == expected


@pytest.mark.parametrize("test_input,expected", [((1, 2), "1 2"), ((1, 2, 3), "1 2 3")])
def test_merge_concat_int(test_input, expected):
    assert merge_concat(*test_input) == expected


# Mixed
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


# String
@pytest.mark.parametrize(
    "test_input,expected", [(("1",), "1"), (("1", "2"), "12"), (("1", "2", "3"), "123"), (("a", "b", "ab"), "abab")]
)
def test_merge_concat_without_separator_string(test_input, expected):
    assert merge_concat_without_separator(*test_input) == expected


@pytest.mark.parametrize(
    "test_input,expected",
    [(("1",), "1"), (("1", "2"), "1 2"), (("1", "2", "3"), "1 2 3"), (("a", "b", "ab"), "a b ab")],
)
def test_merge_concat_string(test_input, expected):
    assert merge_concat(*test_input) == expected
