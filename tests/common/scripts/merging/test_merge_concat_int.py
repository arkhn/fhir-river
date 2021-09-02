import pytest

from common.scripts.merging import merge_concat, merge_concat_without_separator


@pytest.mark.parametrize("test_input,expected", [((1, 2), "12"), ((1, 2, 3), "123")])
def test_merge_concat_without_separator_string(test_input, expected):
    assert merge_concat_without_separator(*test_input) == expected


@pytest.mark.parametrize("test_input,expected", [((1, 2), "1 2"), ((1, 2, 3), "1 2 3")])
def test_merge_concat_string(test_input, expected):
    assert merge_concat(*test_input) == expected
