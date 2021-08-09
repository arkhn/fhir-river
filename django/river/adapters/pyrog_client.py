from river.common.mapping.fetch_mapping import fetch_resource_mapping

# FIXME this shouldn't be needed when the DB is shared


class PyrogClient:
    """This class is an abstraction that is used when we need to fetch a mapping.
    It has a single method `get` with the mapping id as argument.
    """

    def fetch_mapping(self, resource_id: str):
        raise NotImplementedError


class FakePyrogClient(PyrogClient):
    def __init__(self, mappings: dict = None):
        self._mappings = mappings or {}
        self._seen = []

    def fetch_mapping(self, resource_id: str):
        if resource_id in self._mappings:
            self._seen.append(resource_id)
        return self._mappings.get(resource_id)


class APIPyrogClient(PyrogClient):
    def __init__(self, authorization_header: str):
        self.authorization_header = authorization_header

    def fetch_mapping(self, resource_id: str):
        return fetch_resource_mapping(resource_id, self.authorization_header)
