import pytest


@pytest.fixture(scope="session")
def dict_map_code():
    return {
        "ABC": "abc",
        "DEF": "def",
        "GHI": "ghi",
    }


@pytest.fixture(scope="session")
def dict_map_gender():
    return {
        "M": "male",
        "F": "female",
    }
