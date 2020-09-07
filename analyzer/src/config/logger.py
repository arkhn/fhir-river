"""
Create the logger to be used in the service
"""

from os import getenv
from sys import stdout
import logging

from arkhn_monitoring import create_logger


FLUENTD_HOST = getenv("FLUENTD_HOST", "fluentd")
FLUENTD_PORT = getenv("FLUENTD_PORT", 24224)
LOGGING_LEVEL = getenv("LOGGING_LEVEL", "INFO")
SERVICE_NAME = getenv("SERVICE_NAME", "analyzer")
TEST = getenv("TEST", False)

logger = None


def get_logger():
    global logger

    if logger is not None:
        return logger

    # When we are doing tests
    if TEST:
        logging.basicConfig(stream=stdout, level=logging.DEBUG)
        logger = logging.getLogger()
        return logger

    extra_fields = ["resource_id"]

    logger = create_logger(
        SERVICE_NAME, FLUENTD_HOST, FLUENTD_PORT, level=LOGGING_LEVEL, extra_fields=extra_fields
    )

    return logger
