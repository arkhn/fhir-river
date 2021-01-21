# flake8: noqa
from rest_framework.test import APIClient

from django.urls import reverse

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


def test_list_scripts_endpoint(api_client: APIClient):
    url = reverse("scripts")
    response = api_client.get(url)
    script_list = response.json()
    assert len(script_list) > 0
    assert {
        "name": "strip",
        "description": "Strip strings, convert NaN and None to empty string",
        "category": "utils",
    } in script_list
    assert response.status_code == 200
