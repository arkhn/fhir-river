import logging
from datetime import timedelta

from django.conf import settings

import redis
from common.batch_types import BatchType
from common.kafka.consumer import Consumer
from common.service.event import Event
from common.service.handler import Handler
from common.service.service import Service
from confluent_kafka.admin import AdminClient
from topicleaner.conf import conf

logger = logging.getLogger(__name__)


class TopicleanerHandler(Handler):
    def __init__(self) -> None:
        self.kafka_admin = AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})
        self.batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
            decode_responses=True,
        )
        self.mappings_redis = redis.Redis(
            host=settings.REDIS_MAPPINGS_HOST, port=settings.REDIS_MAPPINGS_PORT, db=settings.REDIS_MAPPINGS_DB
        )

    def is_end_of_batch(self, batch_id: str) -> bool:
        batch_resources = self.batch_counter_redis.smembers(f"{BatchType.BATCH}:{batch_id}:resources")
        counter = self.batch_counter_redis.hgetall(f"{BatchType.BATCH}:{batch_id}:counter")

        for resource_id in batch_resources:
            extracted_count = counter.get(f"resource:{resource_id}:extracted")
            if not extracted_count:
                return False
            extracted_count = int(extracted_count)
            if extracted_count == 0:
                continue

            loaded_count = counter.get(f"resource:{resource_id}:loaded")
            if not loaded_count:
                return False
            loaded_count = int(loaded_count)
            if loaded_count < extracted_count:
                return False

        return True

    def delete_batch(self, batch_id: str, batch_type: str = str(BatchType.BATCH)) -> None:
        # Delete kafka topics
        self.kafka_admin.delete_topics(
            [
                f"trigger.{batch_type}.{batch_id}",
                f"extract.{batch_type}.{batch_id}",
                f"transform.{batch_type}.{batch_id}",
                f"load.{batch_type}.{batch_id}",
            ]
        )

        # Delete redis keys
        self.batch_counter_redis.hdel("{BatchType.BATCH}", batch_id)
        self.batch_counter_redis.delete(f"{BatchType.BATCH}:{batch_id}:resources")
        self.batch_counter_redis.expire(f"{BatchType.BATCH}:{batch_id}:counter", timedelta(weeks=2))
        for key in self.mappings_redis.scan_iter(f"{batch_id}:*"):
            self.mappings_redis.delete(key)

    def __call__(self, event: Event):
        batch_id = event.data["batch_id"]

        if self.is_end_of_batch(batch_id):
            self.delete_batch(batch_id)


class TopicleanerService(Service):
    @classmethod
    def make_app(cls):
        consumer = Consumer(
            broker=settings.KAFKA_BOOTSTRAP_SERVERS,
            topics=conf.CONSUMED_TOPICS,
            group_id=conf.CONSUMER_GROUP_ID,
        )
        handler = TopicleanerHandler()
        return Service(consumer, handler)
