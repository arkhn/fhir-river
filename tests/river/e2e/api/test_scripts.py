import pytest

from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_list_scripts(api_client, snapshot):
    url = reverse("scripts")

    response = api_client.get(url)

    assert response.status_code == 200, response.data
    assert response.data == snapshot
