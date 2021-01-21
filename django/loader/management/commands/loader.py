import logging

from django.core.management.base import BaseCommand

from loader.service import LoaderService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        logger.info("Starting...")

        app = LoaderService.make_app()
        app.run()
