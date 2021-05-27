from typing import Optional

import redis

from django.conf import settings


class DecrementingCounter:
    def set(self, id: str, value: int):
        raise NotImplementedError

    def decr(self, id: str):
        raise NotImplementedError

    def get(self, id: str) -> int:
        raise NotImplementedError


class FakeDecrementingCounter(DecrementingCounter):
    def __init__(self):
        self._count = {}

    def set(self, id: str, value: int):
        self._count = {id: value}

    def decr(self, id: str):
        self._count[id] -= 1

    def get(self, id: str) -> int:
        return self._count[id]


class RedisDecrementingCounter(DecrementingCounter):
    def __init__(self):
        self._client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
        )

    def set(self, id: str, value: int):
        self._client.hset("decr_counters", id, value)

    def decr(self, id: str):
        self._client.hincrby("decr_counters", id, -1)

    def get(self, id: str) -> Optional[int]:
        raw = self._client.hget("decr_counters", id)
        return int(raw) if raw else None
