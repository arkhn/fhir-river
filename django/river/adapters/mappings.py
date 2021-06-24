from typing import Any

from common.mapping.fetch_mapping import fetch_resource_mapping
from utils.caching import cache


class MappingUnavailable(Exception):
    pass


def build_repository_key(batch_id: str, resource_id: str):
    return f"{batch_id}:{resource_id}"


class MappingsRepository:
    """This class is an abstraction that is used when we need to fetch a mapping.
    It has a single method `get` with the mapping id as argument.
    """

    def set(self, batch_id: str, resource_id: str, mapping: Any):
        raise NotImplementedError

    def get(self, batch_id: str, resource_id: str):
        raise NotImplementedError


class FakeMappingsRepository(MappingsRepository):
    def __init__(self, mappings: dict = None):
        self._mappings = mappings or {}
        self._seen = []

    def set(self, batch_id: str, resource_id: str, mapping: Any):
        key = build_repository_key(batch_id, resource_id)
        self._mappings[key] = mapping

    def get(self, batch_id: str, resource_id: str):
        key = build_repository_key(batch_id, resource_id)
        self._seen.append(ikeyd)
        return self._mappings[key]


class RedisMappingsRepository(MappingsRepository):
    def __init__(self, mapping_redis: redis.Redis):
        self.mapping_redis = mapping_redis

    def set(self, batch_id: str, resource_id: str, mapping: Any):
        key = build_repository_key(batch_id, resource_id)
        self.mappings_redis.set(key, json.dumps(resource_mapping))

    def get(self, batch_id: str, resource_id: str):
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
