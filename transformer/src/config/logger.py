"""
Create the logger to be used in the service
"""

from fluent import handler
import logging


class CustomFilter(logging.Filter):
    def filter(self, record):
        if not hasattr(record, "resource_id"):
            record.resource_id = None
        return True


def create_logger(name, level="DEBUG"):
    custom_format = {
        "where": "%(module)s.%(funcName)s",
        "type": "%(levelname)s",
        "service": "transformer",
        "resource_id": "%(resource_id)s",
    }

    logger = logging.getLogger(name)
    logger.propagate = False

    h = handler.FluentHandler("river.extractor", host="fluentd", port=24224)
    formatter = handler.FluentRecordFormatter(custom_format)
    h.setFormatter(formatter)
    logger.addHandler(h)
    logger.addFilter(CustomFilter())
    logger.setLevel(getattr(logging, level))

    return logger