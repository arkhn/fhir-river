import inspect
import json
import time
from pathlib import Path

import pytest
import redis
from confluent_kafka import admin
from factory import Factory
from pytest_factoryboy import register

from django.conf import settings

from tests.pyrog.factories import ResourceFactory

from . import factories

DATA_FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"

register(factories.BatchFactory)
register(factories.ErrorFactory)
register(ResourceFactory)


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


@pytest.fixture(scope="session")
def kafka_admin():
    return admin.AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})


@pytest.fixture(scope="session")
def redis_client():
    return redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)


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


@pytest.fixture(autouse=True)
def clear_redis(request):
    """Clear redis after each test marked with `redis`."""

    def _clear_redis():
        r = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)
        r.flushdb()

    if request.node.get_closest_marker("redis"):
        request.addfinalizer(_clear_redis)


@pytest.fixture
def export_data(request):
    marker = request.node.get_closest_marker("export_data")
    with open(DATA_FIXTURES_DIR / marker.args[0]) as f:
        return json.load(f)


@pytest.fixture
def patient_mapping():
    with (DATA_FIXTURES_DIR / "patient_mapping.json").open() as f:
        return json.load(f)


@pytest.fixture
def mimic_mapping():
    return factories.mimic_mapping()


@pytest.fixture
def users_to_patients_mapping():
    with (DATA_FIXTURES_DIR / "users_to_patients_mapping.json").open() as f:
        return json.load(f)
