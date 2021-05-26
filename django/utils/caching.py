import functools
import inspect

import redis

from django.conf import settings


class CacheBackend:
    def set(self, key: str, value):
        raise NotImplementedError

    def get(self, key: str):
        raise NotImplementedError


class InMemoryCacheBackend(dict):
    def set(self, key: str, value):
        self[key] = value


class RedisCacheBackend:
    def __init__(self):
        self._client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
        )

    def set(self, key: str, value):
        self._client.set(key, value)

    def get(self, key: str):
        return self._client.get(key)


CACHE_BACKENDS = {"redis": RedisCacheBackend, "memory": InMemoryCacheBackend}


def cache(key_param: str, backend: str = "redis"):
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
            backend_instance.set(key, ret)
            return ret

        return _cached_func

    return _decorator
