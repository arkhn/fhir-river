import logging

from django.core.management.base import BaseCommand

from extractor.service import ExtractorApplication

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        logger.info("Starting...")

        app = ExtractorApplication.make_app()
        app.run()
