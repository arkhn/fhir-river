import logging

from django.core.management.base import BaseCommand

from loader.service import LoaderService
from utils.exporter import start_exporter

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        start_exporter()

        logger.info("Starting...")
        app = LoaderService.make_app()
        app.run()
