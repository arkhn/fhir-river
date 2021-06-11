import pytest

from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_preview(api_client):
    url = reverse("scripts")

    response = api_client.get(url)

    assert response.status_code == 200
