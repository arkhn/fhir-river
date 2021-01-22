from unittest import mock

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


@mock.patch("control.api.views.getmembers")
@mock.patch("control.api.views.getdoc")
def test_list_scripts_endpoint(mock_getdoc, mock_getmembers, api_client: APIClient):
    mock_getmembers.side_effect = [
        [("module1", None), ("module2", None)],
        [("script1", None), ("script2", None)],
        [("script3", None), ("script4", None)],
    ]
    mock_getdoc.return_value = "description"

    url = reverse("scripts")
    response = api_client.get(url)
    assert response.status_code == 200

    script_list = response.json()
    assert script_list == [
        {"category": "module1", "description": "description", "name": "script1"},
        {"category": "module1", "description": "description", "name": "script2"},
        {"category": "module2", "description": "description", "name": "script3"},
        {"category": "module2", "description": "description", "name": "script4"},
    ]
