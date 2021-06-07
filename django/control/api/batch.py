import json
import logging
import uuid
from datetime import datetime, timedelta

from rest_framework import status, viewsets
from rest_framework.response import Response

from django.conf import settings

import redis
from common.kafka.producer import Producer
from common.mapping.fetch_mapping import fetch_resource_mapping
from confluent_kafka import KafkaException
from confluent_kafka.admin import AdminClient, NewTopic
from control.api.serializers import CreateBatchSerializer
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

        batches = batch_counter_redis.hgetall("batch")

        batch_list = []
        for batch_id, batch_timestamp in batches.items():
            batch_resource_ids = batch_counter_redis.smembers(f"batch:{batch_id}:resources")
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
        batch_counter_redis.hset("batch", batch_id, batch_timestamp)
        batch_counter_redis.sadd(f"batch:{batch_id}:resources", *resource_ids)

        # Create kafka topics for batch
        new_topics = [
            NewTopic(f"batch.{batch_id}", settings.KAFKA_NUM_PARTITIONS, settings.KAFKA_REPLICATION_FACTOR),
            NewTopic(f"extract.{batch_id}", settings.KAFKA_NUM_PARTITIONS, settings.KAFKA_REPLICATION_FACTOR),
            NewTopic(f"transform.{batch_id}", settings.KAFKA_NUM_PARTITIONS, settings.KAFKA_REPLICATION_FACTOR),
            NewTopic(f"load.{batch_id}", settings.KAFKA_NUM_PARTITIONS, settings.KAFKA_REPLICATION_FACTOR),
        ]
        admin_client = AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})
        admin_client.create_topics(new_topics)

        # Send event to the extractor
        producer = Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS)
        for resource_id in resource_ids:
            event = {"batch_id": batch_id, "resource_id": resource_id}
            try:
                producer.produce_event(topic=f"batch.{batch_id}", event=event)
            except (KafkaException, ValueError) as err:
                logger.exception(err)
                # Clean the batch
                TopicleanerHandler().delete_batch(batch_id)
                return Response(
                    {"id": batch_id, "error": "error while producing extract events"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response({"id": batch_id, "timestamp": batch_timestamp}, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        # Delete kafka topics
        admin_client = AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})
        admin_client.delete_topics([f"batch.{pk}", f"extract.{pk}", f"transform.{pk}", f"load.{pk}"])

        # Delete keys from redis
        batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
        )
        batch_counter_redis.hdel("batch", pk)
        batch_counter_redis.delete(f"batch:{pk}:resources")
        batch_counter_redis.expire(f"batch:{pk}:counter", timedelta(weeks=2))

        mappings_redis = redis.Redis(
            host=settings.REDIS_MAPPINGS_HOST, port=settings.REDIS_MAPPINGS_PORT, db=settings.REDIS_MAPPINGS_DB
        )
        for key in mappings_redis.scan_iter(f"{pk}:*"):
            mappings_redis.delete(key)

        return Response({"id": pk}, status=status.HTTP_200_OK)
