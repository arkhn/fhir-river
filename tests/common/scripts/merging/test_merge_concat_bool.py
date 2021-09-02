import pytest

from common.scripts.merging import merge_concat, merge_concat_without_separator


@pytest.mark.parametrize("test_input,expected", [(([True]), "True"), ((True, False), "TrueFalse")])
def test_merge_concat_without_separator_bool(test_input, expected):
    assert merge_concat_without_separator(*test_input) == expected


@pytest.mark.parametrize("test_input,expected", [(([True]), "True"), ((True, False), "True False")])
def test_merge_concat_bool(test_input, expected):
    assert merge_concat(*test_input) == expected
