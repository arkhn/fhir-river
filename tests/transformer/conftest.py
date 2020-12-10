from pytest import fixture


@fixture(scope="session")
def dict_map_code():
    return {
        "ABC": "abc",
        "DEF": "def",
        "GHI": "ghi",
    }


@fixture(scope="session")
def dict_map_gender():
    return {
        "M": "male",
        "F": "female",
    }


@fixture(scope="session")
def dict_map_identifier():
    return {
        "1": "A",
        "2": "B",
        "3": "C",
    }
