import logging

from django.core.management.base import BaseCommand

from loader.service import LoaderApplication

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        logger.info("Starting...")

        app = LoaderApplication.make_app()
        app.run()
