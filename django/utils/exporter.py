import logging

from django.conf import settings

from prometheus_client import start_http_server

logger = logging.getLogger(__name__)


def start_exporter():
    logger.info(f"Exporter listening on port {settings.EXPORTER_PORT}")
    start_http_server(settings.EXPORTER_PORT)
