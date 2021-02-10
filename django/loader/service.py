import logging

from django.conf import settings

import redis
from common.analyzer import Analyzer
from common.kafka.consumer import Consumer
from common.kafka.producer import Producer
from common.service.errors import BatchCancelled
from common.service.event import Event
from common.service.handler import Handler
from common.service.service import Service
from loader.conf import conf
from loader.load import Loader
from loader.load.fhirstore import get_fhirstore
from loader.reference_binder import ReferenceBinder
from pymongo.errors import DuplicateKeyError

logger = logging.getLogger(__name__)


def load(
    fhir_object: dict,
    batch_id: str,
    resource_id: str,
    loader: Loader,
    producer: Producer,
    binder: ReferenceBinder,
    counter_redis: redis.Redis,
    analyzer: Analyzer,
):
    analysis = analyzer.load_cached_analysis(batch_id, resource_id)

    # Resolve existing and pending references (if the fhir_instance
    # references OR is referenced by other documents)
    logger.debug(
        {
            "message": f"Resolving references {analysis.reference_paths}",
            "resource_id": resource_id,
        },
    )
    resolved_fhir_instance = binder.resolve_references(fhir_object, analysis.reference_paths)

    try:
        logger.debug({"message": "Writing document to mongo", "resource_id": resource_id})
        loader.load(
            resolved_fhir_instance,
            resource_type=resolved_fhir_instance["resourceType"],
        )
        # Increment loaded resources counter in Redis
        counter_redis.hincrby(f"batch:{batch_id}:counter", f"resource:{resource_id}:loaded", 1)
        producer.produce_event(
            topic=f"{conf.PRODUCED_TOPIC_PREFIX}{batch_id}",
            event={"batch_id": batch_id},
        )
    except DuplicateKeyError as err:
        logger.exception(err)
    except BatchCancelled as err:
        logger.warning({"message": str(err), "resource_id": resource_id, "batch_id": batch_id})


class LoadHandler(Handler):
    def __init__(
        self,
        producer: Producer,
        loader: Loader,
        binder: ReferenceBinder,
        counter_redis: redis.Redis,
        analyzer: Analyzer,
    ) -> None:
        self.producer = producer
        self.loader = loader
        self.binder = binder
        self.counter_redis = counter_redis
        self.analyzer = analyzer

    def __call__(self, event: Event):
        load(
            producer=self.producer,
            loader=self.loader,
            binder=self.binder,
            counter_redis=self.counter_redis,
            analyzer=self.analyzer,
            **event.data,
        )


class LoaderService(Service):
    @classmethod
    def make_app(cls):
        fhirstore_client = get_fhirstore()
        loader = Loader(fhirstore_client)
        binder = ReferenceBinder(fhirstore_client)

        consumer = Consumer(
            broker=settings.KAFKA_BOOTSTRAP_SERVERS,
            topics=conf.CONSUMED_TOPICS,
            group_id=conf.CONSUMER_GROUP_ID,
        )
        mapping_redis = redis.Redis(
            host=settings.REDIS_MAPPINGS_HOST,
            port=settings.REDIS_MAPPINGS_PORT,
            db=settings.REDIS_MAPPINGS_DB,
        )
        counter_redis = redis.Redis(
            host=settings.REDIS_COUNTER_HOST,
            port=settings.REDIS_COUNTER_PORT,
            db=settings.REDIS_COUNTER_DB,
        )
        analyzer = Analyzer(redis_client=mapping_redis)
        handler = LoadHandler(
            producer=Producer(broker=settings.KAFKA_BOOTSTRAP_SERVERS),
            loader=loader,
            binder=binder,
            counter_redis=counter_redis,
            analyzer=analyzer,
        )
        return Service(consumer, handler)
