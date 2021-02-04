import logging
from datetime import timedelta

from django.conf import settings

import redis
from common.kafka.consumer import Consumer
from common.service.event import Event
from common.service.handler import Handler
from common.service.service import Service
from confluent_kafka.admin import AdminClient
from topicleaner.conf import conf

logger = logging.getLogger(__name__)


class TopicleanerHandler(Handler):
    def __init__(
        self,
    ) -> None:
        self.kafka_admin = AdminClient({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})
        self.batch_counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
            decode_responses=True,
        )

    def is_end_of_batch(self, batch_id: str):
        batch_resources = self.batch_counter_redis.smembers(f"batch:{batch_id}:resources")
        counter = self.batch_counter_redis.hgetall(f"batch:{batch_id}:counter")

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

    def __call__(self, event: Event):
        batch_id = event.data["batch_id"]

        if self.is_end_of_batch(batch_id):
            # Delete kafka topics
            self.kafka_admin.delete_topics(
                [f"batch.{batch_id}", f"extract.{batch_id}", f"transform.{batch_id}", f"load.{batch_id}"]
            )

            # Delete redis keys
            self.batch_counter_redis.hdel("batch", batch_id)
            self.batch_counter_redis.delete(f"batch:{batch_id}:resources")
            self.batch_counter_redis.expire(f"batch:{batch_id}:counter", timedelta(weeks=2))


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
