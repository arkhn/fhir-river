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


def load_mapping(path: Path) -> dict:
    data = load_export_data(path)
    if os.environ.get("ENV") == "dev":
        data["credential"] = {
            **data["credential"],
            "host": "localhost",
            "port": 5432,
            "login": "river",
            "password": "river",
            "database": "river",
        }
    return data
