import logging

from django.core.management.base import BaseCommand

from transformer.service import TransformerApplication

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        logger.info("Starting...")

        app = TransformerApplication.make_app()
        app.run()
