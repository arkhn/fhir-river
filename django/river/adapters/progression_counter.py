from dataclasses import dataclass
from typing import Optional

import redis

from django.conf import settings


@dataclass(frozen=True)
class Progression:
    extracted: int
    loaded: int
    failed: int


class ProgressionCounter:
    """Abstract class used to track the progression of an ETL.

    A `ProgressionCounter` is basically a key-value store.
    The keys should identify a (batch, pyrog source) couple and each key gives access to
    2 values. One of this value is the number of resources extracted for the
    corresponding key and the other is the number of resources currenlty loaded in the
    target DB.

    A `ProgressionCounter` should have 3 methods:
        - set_extracted: sets the value corresponding to the number of extracted
            resources
        - increment_loaded: increments by 1 the value corresponding to the number of
            loaded resources
        - increment_failed: increments by 1 the value corresponding to the number of
            failed resources
        - get: returns both counters for a specified key

    """

    def set_extracted(self, id: str, value: int):
        raise NotImplementedError

    def increment_loaded(self, id: str):
        raise NotImplementedError

    def increment_failed(self, id: str):
        raise NotImplementedError

    def get(self, id: str) -> Optional[Progression]:
        raise NotImplementedError


class FakeProgressionCounter(ProgressionCounter):
    """ProgressionCounter using an in-memory dict as a data structure.

    Attributes:
        _count (dict of str: dict): The dict in which are stored the counters.
        It has the form:
            {
                "key1": {"extracted": nb_extracted_1,
                        "loaded": nb_loaded_1,
                        "failed": nb_failed_2},
                "key2": {"extracted": nb_extracted_2,
                        "loaded": nb_loaded_2,
                        "failed": nb_failed_3},
                ...
            }

    """

    def __init__(self, counts=dict()):
        self._count = counts

    def set_extracted(self, id: str, value: int) -> None:
        """Sets the value corresponding to the number of extracted resources."""
        self._count[id] = {"extracted": value}

    def increment_loaded(self, id: str) -> None:
        """Increments by 1 the value corresponding to the number of loaded resources."""
        if id not in self._count:
            self._count[id] = {}
        if "loaded" not in self._count[id]:
            self._count[id]["loaded"] = 0
        self._count[id]["loaded"] += 1

    def increment_failed(self, id: str) -> None:
        """Increments by 1 the value corresponding to the number of failed resources."""
        if id not in self._count:
            self._count[id] = {}
        if "failed" not in self._count[id]:
            self._count[id]["failed"] = 0
        self._count[id]["failed"] += 1

    def get(self, id: str) -> Optional[Progression]:
        """Gets both counters for the specified key.

        Args:
            id: The key corresponding to the current (batch, resource).

        Returns:
            A tuple with the number of extracted resources (or None if not found) and
                and the number of loaded resources (or None if not found)
                and the number of failed resources (or None if not found).

        """
        counters = self._count.get(id)
        if not counters:
            return None

        extracted = counters.get("extracted")
        loaded = counters.get("loaded")
        failed = counters.get("failed")

        return Progression(extracted=extracted, loaded=loaded, failed=failed)


class RedisProgressionCounter(ProgressionCounter):
    """ProgressionCounter using two Redis hashes to record extract and load

    Attributes:
        _client (redis.Redis): The redis client used to access the backend redis DB.

    """

    def __init__(self):
        self._client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)

    def set_extracted(self, id: str, value: int) -> None:
        """Sets the value corresponding to the number of extracted resources."""
        self._client.hset("extracted_counters", id, value)

    def increment_loaded(self, id: str) -> None:
        """Increments by 1 the value corresponding to the number of loaded resources."""
        self._client.hincrby("loaded_counters", id, 1)

    def increment_failed(self, id: str) -> None:
        """Increments by 1 the value corresponding to the number of failed resources."""
        self._client.hincrby("failed_counters", id, 1)

    def get(self, id: str) -> Optional[Progression]:
        """Gets both counters for the specified key.

        Args:
            id: The key corresponding to the current (batch, resource).

        Returns:
            A tuple with the number of extracted resources (or None if not found)
                and the number of loaded resources (or None if not found)
                and the number of failed resources (or None if not found).

        """
        raw_extracted = self._client.hget("extracted_counters", id)
        raw_loaded = self._client.hget("loaded_counters", id)
        raw_failed = self._client.hget("failed_counters", id)
        extracted = int(raw_extracted) if raw_extracted else None
        loaded = int(raw_loaded) if raw_loaded else None
        failed = int(raw_failed) if raw_failed else None

        return Progression(extracted=extracted, loaded=loaded, failed=failed)
