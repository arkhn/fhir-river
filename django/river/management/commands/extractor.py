import logging

from django.core.management.base import BaseCommand

from river.adapters.event_publisher import KafkaEventPublisher
from river.adapters.event_subscriber import KafkaEventSubscriber
from river.adapters.mappings import RedisMappingsRepository
from river.adapters.progression_counter import RedisProgressionCounter
from river.extractor.service import bootstrap
from utils.exporter import start_exporter

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        start_exporter()

        logger.info("Starting...")
        service = bootstrap(
            KafkaEventSubscriber(group_id="extractor"),
            KafkaEventPublisher(),
            RedisMappingsRepository(),
            RedisProgressionCounter(),
        )
        service.run()
