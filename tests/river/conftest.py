import inspect
import json
import time
from pathlib import Path

import pytest
from confluent_kafka import admin
from factory import Factory
from pytest_factoryboy import register

from django.conf import settings

from . import factories

DATA_FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"

register(factories.BatchFactory)
register(factories.ErrorFactory)


def get_factories():
    return [
        factory
        for (_, factory) in inspect.getmembers(factories, lambda o: inspect.isclass(o) and issubclass(o, Factory))
    ]


@pytest.fixture
def reset_factories_sequences():
    """Reset all sequences for predictable values."""
    for factory in get_factories():
        factory.reset_sequence()


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
def load_mapping_fixture():
    def _load_mapping(filename: str):
        with (DATA_FIXTURES_DIR / filename).open() as f:
            return json.load(f)

    yield _load_mapping


@pytest.fixture
def patient_mapping(load_mapping_fixture):
    return load_mapping_fixture("patient_mapping.json")


@pytest.fixture
def mappings(load_mapping_fixture):
    return load_mapping_fixture("users_to_patients_mapping.json")