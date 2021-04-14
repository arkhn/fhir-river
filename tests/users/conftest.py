import inspect

import pytest
from factory import Factory
from pytest_factoryboy import register

from . import factories

register(factories.UserFactory)


def get_factories():
    return [
        factory
        for (_, factory) in inspect.getmembers(factories, lambda o: inspect.isclass(o) and issubclass(o, Factory))
    ]


@pytest.fixture(autouse=True)
def reset_factories_sequences():
    """Reset all sequences for predictable values."""

    for factory in get_factories():
        factory.reset_sequence()
