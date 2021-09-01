import datetime

import pytest

from common.scripts.merging import merge_concat_without_separator


@pytest.fixture
def fixturenow():
    return datetime.datetime.now()


@pytest.fixture
def fixture2020dt():
    return datetime.datetime(2020, 5, 17)


@pytest.fixture
def fixture2020date():
    return datetime.date(2020, 5, 17)


@pytest.fixture
def fixturea():
    return "a"


@pytest.fixture
def fixturetesting():
    return "testing"


def test_merge_concat_without_separator_string(fixturenow, fixturea, fixturetesting, fixture2020dt, fixture2020date):
    # Tests datetime

    assert merge_concat_without_separator(fixturea, fixturenow) == f"a{fixturenow}"

    assert merge_concat_without_separator(fixturetesting, fixture2020date) == "testing2020-05-17"

    assert merge_concat_without_separator(fixturetesting, fixture2020dt) == "testing2020-05-17 00:00:00"


#     # Test boolean

#     assert merge_concat_without_separator(True) == "True"

#     assert merge_concat_without_separator(True, False) == "TrueFalse"

#     # Test mixed
#     dateNow = datetime.datetime.now()
#     assert (
#         merge_concat_without_separator("a", dateNow, datetime.date(2020, 5, 17), True)
#         == f"a{dateNow}2020-05-17True"
#     )
