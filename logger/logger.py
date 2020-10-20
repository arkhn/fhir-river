"""
Create the logger to be used in the service
"""

from os import getenv
from sys import stdout
import logging
import sys
import traceback

from arkhn_monitoring import create_logger


FLUENTD_HOST = getenv("FLUENTD_HOST", "fluentd")
FLUENTD_PORT = getenv("FLUENTD_PORT", 24224)
LOGGING_LEVEL = getenv("LOGGING_LEVEL", "INFO")
SERVICE_NAME = getenv("SERVICE_NAME", "analyzer")
ENV = getenv("ENV")
IN_PROD = ENV != "test"

logger = None


def get_logger(extra_fields=[]):
    global logger

    if logger is not None:
        return logger

    # When we are doing tests
    if not IN_PROD:
        logging.basicConfig(stream=stdout, level=logging.DEBUG)
        logger = logging.getLogger()
        return logger

    logger = create_logger(
        SERVICE_NAME, FLUENTD_HOST, FLUENTD_PORT, level=LOGGING_LEVEL, extra_fields=extra_fields
    )

    return logger


def format_traceback():
    """ Helper function to cast the traceback to a string in order to log it. """
    return "".join(traceback.format_exception(*sys.exc_info()))
