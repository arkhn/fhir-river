import logging

from django.conf import settings

import redis
from common.kafka.consumer import Consumer
from common.kafka.producer import Producer
from common.service.errors import BatchCancelled
from common.service.event import Event
from common.service.handler import Handler
from common.service.service import Service
from loader.conf import conf
from loader.load import Loader
from loader.load.fhirstore import get_fhirstore

logger = logging.getLogger(__name__)


def load(
    fhir_object: dict,
    batch_id: str,
    resource_id: str,
    loader: Loader,
    producer: Producer,
    counter_redis: redis.Redis,
):
    try:
        logger.debug({"message": "Writing document to mongo", "resource_id": resource_id})
        loader.load(
            fhir_object,
            resource_type=fhir_object["resourceType"],
        )

        # Increment loaded resources counter in Redis
        counter_redis.hincrby(f"batch:{batch_id}:counter", f"resource:{resource_id}:loaded", 1)

        producer.produce_event(
            topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}",
            event={"batch_id": batch_id},
        )
    except BatchCancelled as err:
        logger.warning({"message": str(err), "resource_id": resource_id, "batch_id": batch_id})


class LoadHandler(Handler):
    def __init__(
        self,
        producer: Producer,
        loader: Loader,
        counter_redis: redis.Redis,
    ) -> None:
        self.producer = producer
        self.loader = loader
        self.counter_redis = counter_redis

    def __call__(self, event: Event):
        load(
            producer=self.producer,
            loader=self.loader,
            counter_redis=self.counter_redis,
            **event.data,
        )


class LoaderService(Service):
    @classmethod
    def make_app(cls):
        fhirstore_client = get_fhirstore()
        loader = Loader(fhirstore_client)

        config = {"max.poll.interval.ms": conf.MAX_POLL_INTERVAL_MS}

        consumer = Consumer(
            broker=settings.KAFKA_BOOTSTRAP_SERVERS,
            topics=conf.CONSUMED_TOPICS,
            group_id=conf.CONSUMER_GROUP_ID,
            config=config,
        )
        counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
        )
        handler = LoadHandler(
            producer=Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS),
            loader=loader,
            counter_redis=counter_redis,
        )
        return Service(consumer, handler)
