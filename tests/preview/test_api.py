from django.urls import reverse
from rest_framework.test import APIClient


# TODO(vmttn): find actual data to use for these tests


def test_preview_endpoint(api_client: APIClient):
    url = reverse("preview")
    data = {
        "preview_id": "foo",
        "resource_id": "foo",
        "primary_key_values": [],
        "mapping": {},
    }
    # response = api_client.post(url, data=data, format="json")
    # assert response.status_code == 200


def test_delete_batch_endpoint(api_client: APIClient):
    url = reverse("delete-resources")
    data = {"resources": []}
    response = api_client.post(url, data=data, format="json")
    # assert response.status_code == 200
