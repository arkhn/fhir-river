import os
from loader.src.config.service_logger import get_logger


REDIS_HOST = os.getenv("LOADER_REDIS_HOST")
REDIS_PORT = os.getenv("LOADER_REDIS_PORT")
REDIS_DB = os.getenv("LOADER_REDIS_DB")
logger = get_logger()
