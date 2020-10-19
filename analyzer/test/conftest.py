import json
from pytest import fixture


@fixture(scope="session")
def patient_mapping():
    with open("analyzer/test/fixtures/patient_mapping.json", "r") as fp:
        return json.load(fp)


@fixture(scope="session")
def dict_map_code():
    return {
        "ABCcleaned": "abc",
        "DEFcleaned": "def",
        "GHIcleaned": "ghi",
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
