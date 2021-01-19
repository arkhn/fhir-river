import logging

from django.core.management.base import BaseCommand

from extractor.service import ExtractorService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        logger.info("Starting...")

        app = ExtractorService.make_app()
        app.run()
