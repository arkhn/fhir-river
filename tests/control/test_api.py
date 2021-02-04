from datetime import timedelta
from unittest import mock

# flake8: noqa
from rest_framework.test import APIClient

from django.urls import reverse

import fakeredis

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


@mock.patch("control.api.views.redis.Redis")
@mock.patch("control.api.views.AdminClient")
def test_get_batch_endpoint(mock_kafka_admin, mock_redis, api_client: APIClient):
    batch_counter_redis = mock.MagicMock()
    batch_counter_redis.hgetall.return_value = {
        "batch_id_1": "batch_timestamp_1",
        "batch_id_2": "batch_timestamp_2",
        "batch_id_3": "batch_timestamp_3",
    }
    batch_counter_redis.smembers.side_effect = [["r11", "r12"], ["r21"], ["r31", "r32", "r33"]]
    mock_redis.return_value = batch_counter_redis

    url = reverse("batch")
    response = api_client.get(url)

    batch_counter_redis.hgetall.assert_has_calls([mock.call("batch")])

    assert response.status_code == 200
    assert response.data == [
        {
            "id": "batch_id_1",
            "timestamp": "batch_timestamp_1",
            "resources": [{"resource_id": "r11"}, {"resource_id": "r12"}],
        },
        {"id": "batch_id_2", "timestamp": "batch_timestamp_2", "resources": [{"resource_id": "r21"}]},
        {
            "id": "batch_id_3",
            "timestamp": "batch_timestamp_3",
            "resources": [{"resource_id": "r31"}, {"resource_id": "r32"}, {"resource_id": "r33"}],
        },
    ]


@mock.patch("control.api.views.redis.Redis")
@mock.patch("control.api.views.AdminClient")
def test_delete_batch_endpoint(mock_kafka_admin, mock_redis, api_client: APIClient):
    batch_counter_redis = mock.MagicMock()
    mappings_redis = mock.MagicMock()
    mappings_redis.scan_iter.return_value = ["id:r_1", "id:r_2", "id:r_3"]
    mock_redis.side_effect = [batch_counter_redis, mappings_redis]

    admin_client = mock.MagicMock()
    mock_kafka_admin.return_value = admin_client

    url = reverse("delete-batch", kwargs={"batch_id": "id"})
    response = api_client.delete(url)

    assert response.data == {"id": "id"}
    assert response.status_code == 200

    admin_client.delete_topics.assert_has_calls([mock.call(["batch.id", "extract.id", "transform.id", "load.id"])])

    batch_counter_redis.hdel.assert_has_calls([mock.call("batch", "id")])
    batch_counter_redis.delete.assert_has_calls([mock.call("batch:id:resources")])
    batch_counter_redis.expire.assert_has_calls([mock.call("batch:id:counter", timedelta(weeks=2))])
    mappings_redis.delete.assert_has_calls([mock.call("id:r_1"), mock.call("id:r_2"), mock.call("id:r_3")])


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
