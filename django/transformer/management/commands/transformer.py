import logging

from django.core.management.base import BaseCommand

from transformer.service import TransformerService
from utils.exporter import start_exporter

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        start_exporter()

        logger.info("Starting...")
        app = TransformerService.make_app()
        app.run()
