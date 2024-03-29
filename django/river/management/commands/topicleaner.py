import logging

from django.core.management.base import BaseCommand

from river.adapters.progression_counter import RedisProgressionCounter
from river.adapters.topics import KafkaTopicsManager
from river.topicleaner.service import run

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        logger.info("Starting...")
        run(RedisProgressionCounter(), KafkaTopicsManager())
