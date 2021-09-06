import pytest

pytestmark = [pytest.mark.django_db, pytest.mark.redis, pytest.mark.kafka]


@pytest.mark.skip(reason="Needs more work")
def test_clean_batch_once_done():
    pass
