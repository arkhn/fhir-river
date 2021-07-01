import json
import logging
from typing import Any

import redis

from django.conf import settings

logger = logging.getLogger(__name__)


class MappingUnavailable(Exception):
    pass


def build_repository_key(batch_id: str, resource_id: str):
    return f"{batch_id}:{resource_id}"


class MappingsRepository:
    """This class is used when we need to fetch a mapping.

    An MappingsRepository is basically an abstraction over a key-value store. It should
    have a method `set` and a method `get`.
    """

    def set(self, batch_id: str, resource_id: str, mapping: Any):
        """Sets a mapping at a specified key."""
        raise NotImplementedError

    def get(self, batch_id: str, resource_id: str):
        """Gets the mapping at a specified key."""
        raise NotImplementedError


class FakeMappingsRepository(MappingsRepository):
    """MappingsRepository that uses an in-memory dict as a key-value store.

    Attributes:
        _mappings (dict of str: dict): dict used as a key-value store.
        _seen (list): used in tests to check which mappings have been fetched from this
            repository.

    """

    def __init__(self, mappings: dict = None):
        self._mappings = mappings or {}
        self._seen = []

    def set(self, batch_id: str, resource_id: str, mapping: Any):
        """Sets the mapping at the key built from batch_id and resource_id."""
        key = build_repository_key(batch_id, resource_id)
        self._mappings[key] = mapping

    def get(self, batch_id: str, resource_id: str):
        """Gets the mapping at the key built from batch_id and resource_id."""
        key = build_repository_key(batch_id, resource_id)
        self._seen.append(key)
        return self._mappings[key]


class RedisMappingsRepository(MappingsRepository):
    """MappingsRepository that uses redis as a backend.

    Attributes:
        mapping_redis (redis.Redis): a redis client used to communicate with the
            redis DB.

    """

    def __init__(self):
        self.mapping_redis = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
        )

    def set(self, batch_id: str, resource_id: str, mapping: Any):
        """Sets the mapping at the key built from batch_id and resource_id."""
        key = build_repository_key(batch_id, resource_id)
        self.mapping_redis.set(key, mapping)

    def get(self, batch_id: str, resource_id: str):
        """Gets the mapping at the key built from batch_id and resource_id."""
        key = build_repository_key(batch_id, resource_id)
        serialized_mapping = self.mapping_redis.get(key)
        if serialized_mapping is None:
            logger.exception(
                {
                    "message": f"Mapping not found for batch {batch_id} and resource {resource_id}",
                    "resource_id": resource_id,
                },
            )
            raise MappingUnavailable(resource_id)
        mapping = json.loads(serialized_mapping)

        return mapping
