import logging

from django.core.management.base import BaseCommand

from transformer.service import TransformerService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        logger.info("Starting...")

        app = TransformerService.make_app()
        app.run()
