import pytest

from django.urls import reverse

pytestmark = [pytest.mark.django_db, pytest.mark.kafka]


def test_create_batch(api_client, mappings):
    url = reverse("batches-list")

    data = {"mappings": mappings}
    response = api_client.post(url, data, format="json")

    assert response.status_code == 201


def test_retrieve_batch(api_client, batch, error):
    url = reverse("batches-detail", kwargs={"pk": batch.id})

    response = api_client.get(url)

    assert response.status_code == 200


@pytest.fixture
def api_batch_factory(api_client):
    """Batch factory to test the underlying topics."""

    def _create_batch(mappings):
        url = reverse("batches-list")
        data = {"mappings": mappings}
        response = api_client.post(url, data, format="json")
        return response.json()["id"]

    yield _create_batch


def test_delete_batch(api_client, api_batch_factory, mappings):
    batch_id = api_batch_factory(mappings=mappings)
    url = reverse("batches-detail", kwargs={"pk": batch_id})

    response = api_client.delete(url)

    assert response.status_code == 204
