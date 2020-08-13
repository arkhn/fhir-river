"""
Create the logger to be used in the service
"""

import os

from arkhn_monitoring import create_logger


FLUENTD_HOST = os.getenv("FLUENTD_HOST", "fluentd")
FLUENTD_PORT = os.getenv("FLUENTD_PORT", 24224)

logger = None


def get_logger(level="INFO"):
    global logger

    if logger is not None:
        return logger

    extra_fields = ["resource_id"]

    logger = create_logger(
        "transformer", FLUENTD_HOST, FLUENTD_PORT, level=level, extra_fields=extra_fields
    )

    return logger
