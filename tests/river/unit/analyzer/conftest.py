import pytest


@pytest.fixture(scope="session")
def dict_map_code():
    return {
        "ABCcleaned": "abc",
        "DEFcleaned": "def",
        "GHIcleaned": "ghi",
    }


@pytest.fixture(scope="session")
def dict_map_gender():
    return {
        "M": "male",
        "F": "female",
    }


@pytest.fixture(scope="session")
def dict_map_identifier():
    return {
        "1": "A",
        "2": "B",
        "3": "C",
    }
