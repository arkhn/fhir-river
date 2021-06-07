import json
import logging
import uuid
from datetime import datetime, timedelta

from rest_framework import status, viewsets
from rest_framework.response import Response

from django.conf import settings

import redis
from common.mapping.fetch_mapping import fetch_resource_mapping
from confluent_kafka import KafkaException
from confluent_kafka.admin import AdminClient
from control.api.serializers import CreateBatchSerializer
from control.batch_helper import create_kafka_topics, send_batch_events
from topicleaner.service import TopicleanerHandler

logger = logging.getLogger(__name__)


class RefreshBatchEndpoint(viewsets.ViewSet):
    def list(self, request):
        batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
            decode_responses=True,
        )

        batches = batch_counter_redis.hgetall("refresh")

        batch_list = []
        for batch_id, batch_timestamp in batches.items():
            batch_resource_ids = batch_counter_redis.smembers(f"refresh:{batch_id}:resources")
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
            host=settings.REDIS_COUNTER_HOST, port=settings.REDIS_COUNTER_PORT, db=settings.REDIS_COUNTER_DB
        )
        batch_counter_redis.hset("refresh", batch_id, batch_timestamp)
        batch_counter_redis.sadd(f"refresh:{batch_id}:resources", *resource_ids)

        # Create kafka topics for batch
        new_topic_names = [f"batch.{batch_id}", f"extract.{batch_id}", f"transform.{batch_id}", f"load.{batch_id}"]
        create_kafka_topics(
            new_topic_names,
            kafka_bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            kafka_num_partitions=settings.KAFKA_NUM_PARTITIONS,
            kafka_replication_factor=settings.KAFKA_REPLICATION_FACTOR,
        )

        # Send event to the extractor
        try:
            send_batch_events(batch_id, resource_ids, settings.KAFKA_BOOTSTRAP_SERVERS)
        except (KafkaException, ValueError) as err:
            logger.exception(err)
            # Clean the batch
            TopicleanerHandler().delete_batch(batch_id)
            return Response(
                {"id": batch_id, "error": "error while producing extract events"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"id": batch_id, "timestamp": batch_timestamp}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        batch_timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

        # Create kafka topics for batch
        new_topic_names = [f"batch.{pk}", f"extract.{pk}", f"transform.{pk}", f"load.{pk}"]
        create_kafka_topics(
            new_topic_names,
            kafka_bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            kafka_num_partitions=settings.KAFKA_NUM_PARTITIONS,
            kafka_replication_factor=settings.KAFKA_REPLICATION_FACTOR,
        )

        # Send event to the extractor
        batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST, port=settings.REDIS_COUNTER_PORT, db=settings.REDIS_COUNTER_DB
        )
        resource_ids = batch_counter_redis.smembers(f"refresh:{pk}:resources")
        try:
            send_batch_events(pk, resource_ids, settings.KAFKA_BOOTSTRAP_SERVERS)
        except (KafkaException, ValueError) as err:
            logger.exception(err)
            # Clean the batch
            TopicleanerHandler().delete_batch(pk)
            return Response(
                {"id": pk, "error": "error while producing extract events"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"id": pk, "timestamp": batch_timestamp}, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        # Delete kafka topics
        admin_client = AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})
        admin_client.delete_topics([f"batch.{pk}", f"extract.{pk}", f"transform.{pk}", f"load.{pk}"])

        # Delete keys from redis
        batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST, port=settings.REDIS_COUNTER_PORT, db=settings.REDIS_COUNTER_DB
        )
        batch_counter_redis.hdel("refresh", pk)
        batch_counter_redis.delete(f"refresh:{pk}:resources")
        batch_counter_redis.expire(f"batch:{pk}:counter", timedelta(weeks=2))

        mappings_redis = redis.Redis(
            host=settings.REDIS_MAPPINGS_HOST, port=settings.REDIS_MAPPINGS_PORT, db=settings.REDIS_MAPPINGS_DB
        )
        for key in mappings_redis.scan_iter(f"{pk}:*"):
            mappings_redis.delete(key)

        return Response({"id": pk}, status=status.HTTP_200_OK)
