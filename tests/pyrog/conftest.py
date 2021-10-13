import inspect

import pytest
from factory import Factory
from pytest_factoryboy import register

from . import factories

register(factories.ProjectFactory)
register(factories.ProjectUserFactory)
register(factories.ResourceFactory)
register(factories.CredentialFactory)
register(factories.AttributeFactory)
register(factories.InputGroupFactory)
register(factories.StaticInputFactory)
register(factories.SQLInputFactory)
register(factories.ColumnFactory)
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


@pytest.fixture
def reset_factories_sequences():
    """Reset all sequences for predictable values."""
    for factory in get_factories():
        factory.reset_sequence()
