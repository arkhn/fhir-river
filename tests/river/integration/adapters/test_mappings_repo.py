import pytest

from river.adapters.mappings import APIMappingsRepository

pytestmark = [pytest.mark.pyrog, pytest.mark.redis]


def test_repository_can_retrieve_mapping():
    APIMappingsRepository()

    # TODO(vmttn): with new pyrog
