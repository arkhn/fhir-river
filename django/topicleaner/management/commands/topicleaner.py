import logging

from django.core.management.base import BaseCommand

from topicleaner.service import run

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        logger.info("Starting...")
        run()
