from typing import Optional

import redis

from django.conf import settings


class ProgressionCounter:
    def set_extracted(self, id: str, value: int):
        raise NotImplementedError

    def increment_loaded(self, id: str):
        raise NotImplementedError

    def get(self, id: str) -> Optional[int]:
        raise NotImplementedError


class FakeProgressionCounter(ProgressionCounter):
    def __init__(self, counts=dict()):
        self._count = counts

    def set_extracted(self, id: str, value: int):
        self._count[id] = {"extracted": value}

    def increment_loaded(self, id: str):
        if id not in self._count:
            self._count[id] = {}
        if "loaded" not in self._count[id]:
            self._count[id]["loaded"] = 0
        self._count[id]["loaded"] += 1

    def get(self, id: str) -> Optional[int]:
        return self._count.get(id, {}).get("extracted"), self._count.get(id, {}).get("loaded")


class RedisProgressionCounter(ProgressionCounter):
    def __init__(self):
        self._client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
        )

    def set_extracted(self, id: str, value: int):
        self._client.hset("extracted_counters", id, value)

    def increment_loaded(self, id: str):
        self._client.hincrby("loaded_counters", id, 1)

    def get(self, id: str) -> Optional[int]:
        raw_extracted = self._client.hget("extracted_counters", id)
        raw_loaded = self._client.hget("loaded_counters", id)
        extracted = int(raw_extracted) if raw_extracted else None
        loaded = int(raw_loaded) if raw_loaded else None
        return extracted, loaded
