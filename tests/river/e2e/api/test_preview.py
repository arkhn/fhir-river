from uuid import uuid4

import pytest

from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_preview(api_client, users_to_patients_mapping):
    url = reverse("preview")

    data = {
        "mapping": users_to_patients_mapping,
        "primary_key_values": [uuid4()],
    }
    response = api_client.post(url, data, format="json")

    assert response.status_code == 200
