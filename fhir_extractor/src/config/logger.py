"""
Create the logger to be used in the service
"""

import logging


def create_logger(name, level="DEBUG"):
    """This function creates a logger"""
    # Create logger
    logger = logging.getLogger(name)
    logger.propagate = False
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(
            logging.Formatter("%(asctime)-15s %(levelname)-8s %(message)s")
        )
        logger.addHandler(handler)
    logger.setLevel(getattr(logging, level))
    return logger
