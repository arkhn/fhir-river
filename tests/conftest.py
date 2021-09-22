import json
import os
from pathlib import Path

import pytest


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture(autouse=True)
def force_authenticate(request, api_client):
    """Automatically authenticate generated requests.

    Check ongoing test for the `as_user` or `as_other_user` marks. To use those marks,
    `user` and `other_user` must be available in the test scope.
    """
    if request.node.get_closest_marker("as_user"):
        user = request.getfixturevalue("user")
        api_client.force_authenticate(user)
    elif request.node.get_closest_marker("as_other_user"):
        other_user = request.getfixturevalue("other_user")
        api_client.force_authenticate(other_user)


def load_export_data(path: Path) -> dict:
    with open(path) as f:
        return json.loads(f.read())


MIMIC_CREDENTIALS = {
    "host": os.environ.get("MIMIC_HOST", "mimic"),
    "port": int(os.environ.get("MIMIC_PORT", 5432)),
    "database": os.environ.get("MIMIC_DB", "mimic"),
    "login": os.environ.get("MIMIC_LOGIN", "mimic"),
    "password": os.environ.get("MIMIC_PASSWORD", "mimic"),
    "model": "POSTGRES",
}


@pytest.fixture
def mimic_credentials():
    return MIMIC_CREDENTIALS


def load_mapping(path: Path) -> dict:
    data = load_export_data(path)
    data["credential"] = {**data["credential"], **MIMIC_CREDENTIALS}
    return data
