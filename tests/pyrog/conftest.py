import inspect

from factory.base import Factory
from pytest_factoryboy import register

from . import factories

for _, f in inspect.getmembers(factories, inspect.isclass):
    if issubclass(f, Factory):
        register(f)
