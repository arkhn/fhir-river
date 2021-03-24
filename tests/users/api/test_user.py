import pytest

from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_retrieve_unauthenticated_user(api_client):
    url = reverse("auth-user-detail")

    response = api_client.get(url)

    assert response.status_code == 403


def test_retrieve_authenticated_user(api_client, user):
    url = reverse("auth-user-detail")
    api_client.force_authenticate(user)

    response = api_client.get(url)

    assert response.status_code == 200
    assert response.data["id"] == user.id
