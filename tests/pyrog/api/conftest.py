from pathlib import Path

import pytest

from tests.conftest import load_export_data

DATA_DIR = Path(__file__).resolve().parent / "data"


@pytest.fixture
def export_data(request):
    marker = request.node.get_closest_marker("export_data")
    return load_export_data(DATA_DIR / "exports" / marker.args[0])


@pytest.fixture(params=(DATA_DIR / "exports" / "valid").glob("*.json"))
def valid_export_data(request):
    return load_export_data(request.param)


@pytest.fixture(params=(DATA_DIR / "exports" / "invalid").glob("*.json"))
def invalid_export_data(request):
    return load_export_data(request.param)
