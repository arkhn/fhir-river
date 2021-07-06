import json

import pytest

from river.adapters.mappings import RedisMappingsRepository

pytestmark = [pytest.mark.redis]


def test_repository_can_retrieve_mapping():
    repository = RedisMappingsRepository()

    mapping = {"key": "val"}
    repository.set("batch_id", "resource_id", json.dumps(mapping))

    fetched_mapping = repository.get("batch_id", "resource_id")

    assert fetched_mapping == mapping
