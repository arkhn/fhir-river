import pytest

from river.adapters.mappings import RedisMappingsRepository

pytestmark = [pytest.mark.pyrog, pytest.mark.redis]


@pytest.mark.skip(reason="wait for new pyrog to test this")
def test_repository_can_retrieve_mapping():
    RedisMappingsRepository()

    # TODO(vmttn): with new pyrog
