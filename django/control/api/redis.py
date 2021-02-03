from django.conf import settings

import redis

batch_counter_redis = redis.Redis(
    host=settings.REDIS_COUNTER_HOST,
    port=settings.REDIS_COUNTER_PORT,
    db=settings.REDIS_COUNTER_DB,
    decode_responses=True,
)

mappings_redis = redis.Redis(
    host=settings.REDIS_MAPPINGS_HOST, port=settings.REDIS_MAPPINGS_PORT, db=settings.REDIS_MAPPINGS_DB
)
