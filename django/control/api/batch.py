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
from control.api.serializers import CreateBatchSerializer
from control.batch_helper import create_kafka_topics, send_batch_events
from topicleaner.service import TopicleanerHandler

logger = logging.getLogger(__name__)


class BatchEndpoint(viewsets.ViewSet):
    def list(self, request):
        batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
            decode_responses=True,
        )

        batches = batch_counter_redis.hgetall(batch_types.BATCH)

        batch_list = []
        for batch_id, batch_timestamp in batches.items():
            batch_resource_ids = batch_counter_redis.smembers(f"{batch_types.BATCH}:{batch_id}:resources")
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
        serializer = CreateBatchSerializer(data=request.data)
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
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
        )
        batch_counter_redis.hset(batch_types.BATCH, batch_id, batch_timestamp)
        batch_counter_redis.sadd(f"{batch_types.BATCH}:{batch_id}:resources", *resource_ids)

        # Create kafka topics for batch
        new_topic_names = [
            f"trigger.{batch_types.BATCH}.{batch_id}",
            f"extract.{batch_types.BATCH}.{batch_id}",
            f"transform.{batch_types.BATCH}.{batch_id}",
            f"load.{batch_types.BATCH}.{batch_id}",
        ]
        create_kafka_topics(new_topic_names)

        # Send event to the extractor
        try:
            send_batch_events(batch_id, batch_types.BATCH, resource_ids)
        except (KafkaException, ValueError) as err:
            logger.exception(err)
            # Clean the batch
            TopicleanerHandler().delete_batch(batch_id, batch_types.BATCH)
            return Response(
                {"id": batch_id, "error": "error while producing extract events"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"id": batch_id, "timestamp": batch_timestamp}, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        TopicleanerHandler().delete_batch(pk, batch_types.BATCH)
        return Response({"id": pk}, status=status.HTTP_200_OK)
