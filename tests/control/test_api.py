from datetime import datetime, timedelta
from unittest import mock

# flake8: noqa
from rest_framework.test import APIClient

from django.urls import reverse

import fakeredis
from confluent_kafka.admin import NewTopic


@mock.patch("control.api.views.redis.Redis", return_value=fakeredis.FakeStrictRedis())
@mock.patch("control.api.views.Extractor")
@mock.patch("control.api.views.fetch_resource_mapping")
def test_preview_endpoint(mock_fetch_mapping, mock_extractor, mock_redis, api_client: APIClient, preview_mapping):
    extractor = mock.MagicMock()
    extractor.split_dataframe.return_value = [
        {
            "patients_row_id_02edb49e": ["PK"],
            "patients_dob_4e3cd18c": ["2000-01-01"],
            "patients_expire_flag_5364901b": [True],
        }
    ]
    mock_extractor.return_value = extractor
    mock_fetch_mapping.return_value = preview_mapping

    url = reverse("preview-list")
    data = {
        "resource_id": "foo",
        "primary_key_values": ["PK"],
    }
    response = api_client.post(url, data=data, format="json")
    assert response.status_code == 200
    assert response.data == {
        "instances": [
            {
                "active": "true",
                "birthDate": "2000-01-01",
                "deceasedBoolean": "True",
                "id": response.data["instances"][0]["id"],
                "resourceType": "Patient",
                "meta": {
                    "lastUpdated": response.data["instances"][0]["meta"]["lastUpdated"],
                    "tag": [
                        {
                            "system": "http://terminology.arkhn.org/CodeSystem/source",
                            "code": "ckdyl65ip0010gu9k22w8kvc1",
                        },
                        {
                            "system": "http://terminology.arkhn.org/CodeSystem/resource",
                            "code": "ckdyl65kh0125gu9kpvjbja6j",
                        },
                    ],
                },
            }
        ],
        "errors": [],
    }


@mock.patch("control.api.views.redis.Redis", return_value=fakeredis.FakeStrictRedis())
@mock.patch("control.api.views.Extractor")
@mock.patch("control.api.views.fetch_resource_mapping")
def test_preview_endpoint_with_error(
    mock_fetch_mapping, mock_extractor, mock_redis, api_client: APIClient, erroneous_mapping
):
    extractor = mock.MagicMock()
    extractor.split_dataframe.return_value = [
        {
            "patients_row_id_02edb49e": ["PK"],
            "patients_dob_4e3cd18c": ["01 01 2000"],
        }
    ]
    mock_extractor.return_value = extractor
    mock_fetch_mapping.return_value = erroneous_mapping

    url = reverse("preview-list")
    data = {
        "resource_id": "foo",
        "primary_key_values": ["PK"],
    }
    response = api_client.post(url, data=data, format="json")
    assert response.status_code == 200
    assert response.data == {
        "instances": [
            {
                "active": "active",
                "birthDate": "01 01 2000",
                "id": response.data["instances"][0]["id"],
                "resourceType": "Patient",
                "meta": {
                    "lastUpdated": response.data["instances"][0]["meta"]["lastUpdated"],
                    "tag": [
                        {
                            "system": "http://terminology.arkhn.org/CodeSystem/source",
                            "code": "ckdyl65ip0010gu9k22w8kvc1",
                        },
                        {
                            "system": "http://terminology.arkhn.org/CodeSystem/resource",
                            "code": "ckdyl65kh0125gu9kpvjbja6j",
                        },
                    ],
                },
            }
        ],
        "errors": ["value could not be parsed to a boolean: Patient.active", "invalid date format: Patient.birthDate"],
    }


@mock.patch("control.api.views.redis.Redis")
def test_get_batch_endpoint(mock_redis, api_client: APIClient):
    batch_counter_redis = mock.MagicMock()
    batch_counter_redis.hgetall.return_value = {
        "batch_id_1": "batch_timestamp_1",
        "batch_id_2": "batch_timestamp_2",
        "batch_id_3": "batch_timestamp_3",
    }
    batch_counter_redis.smembers.side_effect = [["r11", "r12"], ["r21"], ["r31", "r32", "r33"]]
    mock_redis.return_value = batch_counter_redis

    url = reverse("batch-list")
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
@mock.patch("control.api.views.get_fhirstore")
@mock.patch("control.api.views.Producer")
@mock.patch("control.api.views.uuid.uuid4", return_value="batch_id")
@mock.patch(
    "control.api.views.fetch_resource_mapping",
    side_effect=[{"mapping_1": "mapping_1"}, {"mapping_2": "mapping_2"}, {"mapping_3": "mapping_3"}],
)
def test_create_batch_endpoint(
    _, __, mock_producer, mock_fhirstore, mock_kafka_admin, mock_redis, api_client: APIClient
):
    batch_counter_redis = mock.MagicMock()
    mappings_redis = mock.MagicMock()
    mock_redis.side_effect = [batch_counter_redis, mappings_redis]

    admin_client = mock.MagicMock()
    mock_kafka_admin.return_value = admin_client

    fhirstore = mock.MagicMock()
    mock_fhirstore.return_value = fhirstore

    producer = mock.MagicMock()
    mock_producer.return_value = producer

    url = reverse("batch-list")
    response = api_client.post(
        url,
        data={
            "resources": [
                {"resource_id": "id_a", "resource_type": "type_a"},
                {"resource_id": "id_b", "resource_type": "type_b"},
                {"resource_id": "id_c", "resource_type": "type_c"},
            ]
        },
        format="json",
    )

    # get timestamp in response
    batch_timestamp = response.data["timestamp"]

    batch_counter_redis.hset.assert_has_calls([mock.call("batch", "batch_id", batch_timestamp)])
    batch_counter_redis.sadd.assert_has_calls([mock.call("batch:batch_id:resources", "id_a", "id_b", "id_c")])

    new_topics = [
        NewTopic("batch.batch_id", 1, 1),
        NewTopic("extract.batch_id", 1, 1),
        NewTopic("transform.batch_id", 1, 1),
        NewTopic("load.batch_id", 1, 1),
    ]
    admin_client.create_topics.assert_has_calls([mock.call(new_topics)])

    mappings_redis.set.assert_has_calls(
        [
            mock.call("batch_id:id_a", '{"mapping_1": "mapping_1"}'),
            mock.call("batch_id:id_b", '{"mapping_2": "mapping_2"}'),
            mock.call("batch_id:id_c", '{"mapping_3": "mapping_3"}'),
        ]
    )

    fhirstore.delete.assert_has_calls(
        [
            mock.call("type_a", resource_id="id_a"),
            mock.call("type_b", resource_id="id_b"),
            mock.call("type_c", resource_id="id_c"),
        ]
    )

    producer.produce_event.assert_has_calls(
        [
            mock.call(topic="batch.batch_id", event={"batch_id": "batch_id", "resource_id": "id_a"}),
            mock.call(topic="batch.batch_id", event={"batch_id": "batch_id", "resource_id": "id_b"}),
            mock.call(topic="batch.batch_id", event={"batch_id": "batch_id", "resource_id": "id_c"}),
        ]
    )

    assert response.status_code == 200


@mock.patch("control.api.views.redis.Redis")
@mock.patch("control.api.views.AdminClient")
def test_delete_batch_endpoint(mock_kafka_admin, mock_redis, api_client: APIClient):
    batch_counter_redis = mock.MagicMock()
    mappings_redis = mock.MagicMock()
    mappings_redis.scan_iter.return_value = ["id:r_1", "id:r_2", "id:r_3"]
    mock_redis.side_effect = [batch_counter_redis, mappings_redis]

    admin_client = mock.MagicMock()
    mock_kafka_admin.return_value = admin_client

    url = reverse("batch-detail", kwargs={"pk": "id"})
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

    url = reverse("scripts-list")
    response = api_client.get(url)
    assert response.status_code == 200

    script_list = response.json()
    assert script_list == [
        {"category": "module1", "description": "description", "name": "script1"},
        {"category": "module1", "description": "description", "name": "script2"},
        {"category": "module2", "description": "description", "name": "script3"},
        {"category": "module2", "description": "description", "name": "script4"},
    ]
