import functools
import inspect
import json
from datetime import timedelta

import redis

from django.conf import settings


class CacheBackend:
    def set(self, key: str, value, **kwargs):
        raise NotImplementedError

    def get(self, key: str):
        raise NotImplementedError


class InMemoryCacheBackend(CacheBackend):
    def __init__(self, init: dict = None):
        self._cache = init or {}

    def set(self, key: str, value, **kwargs):
        self._cache[key] = value

    def get(self, key: str):
        return self._cache.get(key, None)


class RedisCacheBackend(CacheBackend):
    def __init__(self):
        self._client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
        )

    def set(self, key: str, value, expire_after: timedelta = None):
        self._client.set(key, json.dumps(value), px=expire_after)

    def get(self, key: str):
        raw = self._client.get(key)
        return json.loads(raw) if raw is not None else None


CACHE_BACKENDS = {"redis": RedisCacheBackend, "memory": InMemoryCacheBackend}


def cache(key_param: str, backend: str = "redis", expire_after: timedelta = None):
    def _decorator(func):
        backend_str = backend or getattr(settings, "CACHE_BACKEND", "redis")
        backend_instance = CACHE_BACKENDS[backend_str]()

        def get_key_value(key_param: str, func, *args, **kwargs):
            index = list(inspect.signature(func).parameters.keys()).index(key_param)
            return (args + tuple(kwargs.values()))[index]

        @functools.wraps(func)
        def _cached_func(*args, **kwargs):
            key = get_key_value(key_param, func, *args, **kwargs)
            cached = backend_instance.get(key)
            if cached is not None:
                return cached

            ret = func(*args, **kwargs)
            backend_instance.set(key, ret, expire_after=expire_after)
            return ret

        return _cached_func

    return _decorator
