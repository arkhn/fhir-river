import json
from pathlib import Path

from pytest import fixture

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


@fixture(scope="session")
def preview_mapping():
    with open(FIXTURES_DIR / "preview_mapping.json", "r") as fp:
        return json.load(fp)


@fixture(scope="session")
def erroneous_mapping():
    with open(FIXTURES_DIR / "erroneous_mapping.json", "r") as fp:
        return json.load(fp)
