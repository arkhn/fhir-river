from uuid import uuid4

import pytest

from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_preview(api_client, mappings):
    url = reverse("preview")

    data = {
        "mapping": mappings,
        "primary_key_values": [uuid4()],
    }
    response = api_client.post(url, data, format="json")

    assert response.status_code == 200
