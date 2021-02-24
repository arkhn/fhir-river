import json
from pathlib import Path

import pytest

DATA_DIR = Path(__file__).resolve().parent / "data"


@pytest.fixture
def exported_source():
    with open(DATA_DIR / "source.json") as f:
        mapping = json.load(f)
    return mapping
