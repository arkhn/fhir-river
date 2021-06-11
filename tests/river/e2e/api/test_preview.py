from uuid import uuid4

import pytest

from django.urls import reverse

pytestmark = pytest.mark.django_db


@pytest.mark.skip(reason="Needs pyrog-api")
def test_preview(api_client):
    url = reverse("preview")

    data = {
        "resource_id": uuid4(),
        "primary_key_values": [uuid4()],
    }
    response = api_client.post(url, data, format="json")

    assert response.status_code == 200
