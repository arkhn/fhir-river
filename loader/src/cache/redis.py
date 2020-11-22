import redis
from loader.src.cache import REDIS_REFERENCES_HOST, REDIS_REFERENCES_PORT, REDIS_REFERENCES_DB


def conn():
    return redis.Redis(host=REDIS_REFERENCES_HOST, port=REDIS_REFERENCES_PORT, db=REDIS_REFERENCES_DB)
