import json
from pathlib import Path

import pytest

DATA_DIR = Path(__file__).resolve().parent / "data"


def load_export_data(path: Path) -> dict:
    with open(path) as f:
        raw_data = f.read()
        filtered_raw_data = "\n".join(filter(lambda l: l[0] != "#", raw_data.split("\n")))
        return json.loads(filtered_raw_data)


@pytest.fixture
def export_data(request):
    marker = request.node.get_closest_marker("export_data")
    return load_export_data(DATA_DIR / "exports" / marker.args[0])


@pytest.fixture(params=(DATA_DIR / "exports" / "valid").glob("*.json"))
def valid_export_data(request):
    return load_export_data(request.param)


@pytest.fixture(params=(DATA_DIR / "exports" / "unvalid").glob("*.json"))
def unvalid_export_data(request):
    return load_export_data(request.param)
