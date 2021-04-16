import inspect

import pytest
from factory import Factory
from pytest_factoryboy import register

from django.conf import settings

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


@pytest.fixture
def credential(source, credential_factory):
    """Override the default fixture with valid credentials

    It actually describes the django test db."""
    return credential_factory(
        source=source,
        host=settings.DATABASES["default"]["HOST"],
        port=settings.DATABASES["default"]["PORT"],
        database=settings.DATABASES["default"]["NAME"],
        login=settings.DATABASES["default"]["USER"],
        password=settings.DATABASES["default"]["PASSWORD"],
        model="POSTGRES",
    )


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
