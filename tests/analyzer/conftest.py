import json
from pathlib import Path

from pytest import fixture

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


@fixture(scope="session")
def patient_mapping():
    with open(FIXTURES_DIR / "patient_mapping.json", "r") as fp:
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
