import redis
from loader.src.cache import REDIS_HOST, REDIS_PORT, REDIS_DB


def conn():
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
