from river.common.mapping.fetch_mapping import fetch_resource_mapping
from utils.caching import cache


class MappingsRepository:
    def get(self, id: str):
        raise NotImplementedError


class FakeMappingsRepository(MappingsRepository):
    def __init__(self, mappings: dict = None):
        self._mappings = mappings or {}
        self._seen = []

    def get(self, id: str):
        self._seen.append(id)
        return self._mappings[id]


class APIMappingsRepository(MappingsRepository):
    def __init__(self, authorization_header: str = ""):
        self._auth_header = authorization_header

    @cache(key_param="id")
    def get(self, id: str):
        # TODO(vmttn): use new pyrog here.
        return fetch_resource_mapping(id, self._auth_header)
