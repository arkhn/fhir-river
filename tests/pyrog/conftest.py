import inspect

import pytest
from factory import Factory
from pytest_factoryboy import register

from . import factories

register(factories.SourceFactory)
register(factories.SourceUserFactory)
register(factories.ResourceFactory)
register(factories.CredentialFactory)
register(factories.AttributeFactory)
register(factories.InputGroupFactory)
register(factories.InputFactory)
register(factories.ColumnFactory)
register(factories.ColumnFactory, "column_with_join", with_join=True)
register(factories.JoinFactory)
register(factories.ConditionFactory)
register(factories.FilterFactory)
register(factories.OwnerFactory)
register(factories.UserFactory)
register(factories.UserFactory, "other_user")


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
