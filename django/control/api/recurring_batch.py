import json
import logging
import uuid
from datetime import datetime

from rest_framework import status, viewsets
from rest_framework.response import Response

from django.conf import settings

import redis
from common import batch_types
from common.mapping.fetch_mapping import fetch_resource_mapping
from confluent_kafka import KafkaException
from control.airflow_client import AirflowClient, AirflowQueryStatusCodeException
from control.api.serializers import CreateRecurringBatchSerializer
from control.batch_helper import create_kafka_topics, send_batch_events
from requests.exceptions import HTTPError
from topicleaner.service import TopicleanerHandler

logger = logging.getLogger(__name__)


class RecurringBatchEndpoint(viewsets.ViewSet):
    def list(self, request):
        batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
            decode_responses=True,
        )

        batches = batch_counter_redis.hgetall(batch_types.RECURRING)

        batch_list = []
        for batch_id, batch_timestamp in batches.items():
            batch_resource_ids = batch_counter_redis.smembers(f"{batch_types.RECURRING}:{batch_id}:resources")
            batch_list.append(
                {
                    "id": batch_id,
                    "timestamp": batch_timestamp,
                    "resources": [{"resource_id": resource_id} for resource_id in batch_resource_ids],
                }
            )

        return Response(batch_list, status=status.HTTP_200_OK)

    def create(self, request):
        # TODO check errors when writing to redis?
        serializer = CreateRecurringBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        resource_ids = [resource.get("resource_id") for resource in data["resources"]]

        authorization_header = request.META.get("HTTP_AUTHORIZATION")

        batch_id = str(uuid.uuid4())
        batch_timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

        # Fetch mapping
        mappings_redis = redis.Redis(
            host=settings.REDIS_MAPPINGS_HOST, port=settings.REDIS_MAPPINGS_PORT, db=settings.REDIS_MAPPINGS_DB
        )

        for resource_id in resource_ids:
            resource_mapping = fetch_resource_mapping(resource_id, authorization_header)
            mappings_redis.set(f"{batch_id}:{resource_id}", json.dumps(resource_mapping))

        # Add batch info to redis
        batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST, port=settings.REDIS_COUNTER_PORT, db=settings.REDIS_COUNTER_DB
        )
        batch_counter_redis.hset(batch_types.RECURRING, batch_id, batch_timestamp)
        batch_counter_redis.sadd(f"{batch_types.RECURRING}:{batch_id}:resources", *resource_ids)

        try:
            # Create kafka topics for batch
            new_topic_names = [
                f"trigger.{batch_types.RECURRING}.{batch_id}",
                f"extract.{batch_types.RECURRING}.{batch_id}",
                f"transform.{batch_types.RECURRING}.{batch_id}",
                f"load.{batch_types.RECURRING}.{batch_id}",
            ]
            create_kafka_topics(new_topic_names)
            send_batch_events(batch_id, batch_types.RECURRING, resource_ids)
        except (KafkaException, ValueError) as err:
            logger.exception(err)
            # Clean the batch
            TopicleanerHandler().delete_batch(batch_id, batch_types.RECURRING)
            return Response(
                {"id": batch_id, "error": "error while producing extract events"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Update Airflow variable to create new DAG
        airflow_client = AirflowClient()
        try:
            get_variable_resp = airflow_client.get(f"variables/{settings.AIRFLOW_UPDATE_VARIABLE}")
            cur_update_variable_value = get_variable_resp.json()["value"]
            new_update_variable_value = {batch_id: data["schedule_interval"], **cur_update_variable_value}

            airflow_client.post("variables", json=new_update_variable_value)
        except (HTTPError, AirflowQueryStatusCodeException):
            return Response(
                {"id": batch_id, "error": "error while updating Airflow variable"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"id": batch_id, "timestamp": batch_timestamp}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        """Route used to create an "update" batch"""
        batch_timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

        batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST, port=settings.REDIS_COUNTER_PORT, db=settings.REDIS_COUNTER_DB
        )
        resource_ids = batch_counter_redis.smembers(f"{batch_types.RECURRING}:{pk}:resources")

        try:
            send_batch_events(pk, batch_types.RECURRING, resource_ids)
        except (KafkaException, ValueError) as err:
            logger.exception(err)
            # Clean the batch
            TopicleanerHandler().delete_batch(pk, batch_types.RECURRING)
            return Response(
                {"id": pk, "error": "error while producing extract events"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"id": pk, "timestamp": batch_timestamp}, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        TopicleanerHandler().delete_batch(pk, batch_types.RECURRING)

        # Update Airflow variable to remove the corresponding DAG
        airflow_client = AirflowClient()
        try:
            get_variable_resp = airflow_client.get(f"variables/{settings.AIRFLOW_UPDATE_VARIABLE}")
            update_variable_value = get_variable_resp.json()["value"]
            popped = update_variable_value.pop(pk, None)
            if popped is None:
                return Response(
                    {"id": pk, "error": f"{pk} not found in Airflow variable dict"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            airflow_client.post("variables", json=update_variable_value)
        except (HTTPError, AirflowQueryStatusCodeException):
            return Response(
                {"id": pk, "error": "error while updating Airflow variable"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"id": pk}, status=status.HTTP_200_OK)
