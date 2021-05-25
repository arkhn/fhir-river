import pytest

from django.urls import reverse

pytestmark = [pytest.mark.django_db, pytest.mark.kafka]


def test_create_batch(api_client):
    url = reverse("batches-list")

    data = {"resources": [{"resource_id": "foo"}]}
    response = api_client.post(url, data, format="json")

    assert response.status_code == 201


def test_retrieve_batch(api_client, batch, error):
    url = reverse("batches-detail", kwargs={"pk": batch.id})

    response = api_client.get(url)

    assert response.status_code == 200


def test_delete_batch(api_client, batch):
    url = reverse("batches-detail", kwargs={"pk": batch})

    response = api_client.delete(url)

    assert response.status_code == 204
