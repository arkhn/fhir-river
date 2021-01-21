from django.conf import settings

import redis


def conn():
    return redis.Redis(
        host=settings.REDIS_REFERENCES_HOST,
        port=settings.REDIS_REFERENCES_PORT,
        db=settings.REDIS_REFERENCES_DB,
    )
