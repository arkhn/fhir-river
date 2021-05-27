import json
import time
from pathlib import Path

import pytest
from confluent_kafka import admin

from django.conf import settings

DATA_FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


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


@pytest.fixture(autouse=True)
def clear_topics(request):
    """Clear topics after each test marked with `kafka`."""

    def _clear_topics():
        admin_client = admin.AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})

        def list_active_topics():
            return [topic for topic in admin_client.list_topics().topics if topic != "__consumer_offsets"]

        active_topics = list_active_topics()

        if len(active_topics) > 0:
            admin_client.delete_topics(active_topics, operation_timeout=1)

            # Wait for the topics to be deleted. Note: the futures returned by
            # `delete_topics` are unreliable to determine whether the topic deletion
            # has been propagated.
            while len(active_topics) > 0:
                time.sleep(0.1)
                active_topics = list_active_topics()

    if request.node.get_closest_marker("kafka"):
        request.addfinalizer(_clear_topics)


@pytest.fixture
def patient_mapping():
    with (DATA_FIXTURES_DIR / "patient_mapping.json").open() as f:
        return json.load(f)
