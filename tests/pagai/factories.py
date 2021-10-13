from uuid import uuid4

import factory

from django.conf import settings

from pyrog import models


class SourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Source"

    id = factory.Sequence(lambda n: f"source_id_{n:04d}")
    name = factory.Sequence(lambda n: f"source_{n}")
    source_user = factory.RelatedFactory("tests.pagai.factories.SourceUserFactory", factory_related_name="project")


class SourceUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.SourceUser"

    id = factory.Sequence(lambda n: f"source_user_id_{n:04d}")
    user = factory.SubFactory("tests.pagai.factories.UserFactory")
    source = factory.SubFactory(SourceFactory)


class CredentialFactory(factory.django.DjangoModelFactory):
    """Valid Credential factory

    This factory only produces credentials corresponding to the django db,
    which is a valid and available database."""

    class Meta:
        model = "pyrog.Credential"

    id = factory.Sequence(lambda n: f"credential_id_{n:04d}")
    source = factory.SubFactory(SourceFactory)
    host = settings.DATABASES["default"]["HOST"]
    port = settings.DATABASES["default"]["PORT"]
    database = settings.DATABASES["default"]["NAME"]
    login = settings.DATABASES["default"]["USER"]
    password = settings.DATABASES["default"]["PASSWORD"]
    model = models.Credential.Dialect.POSTGRESQL


class ResourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Resource"

    id = factory.Sequence(lambda n: f"resource_id_{n:04d}")
    source = factory.SubFactory(SourceFactory)
    primary_key_owner = factory.SubFactory("tests.pagai.factories.OwnerFactory")
    logical_reference = factory.Sequence(lambda n: uuid4())


class OwnerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Owner"

    id = factory.Sequence(lambda n: f"owner_id_{n:04d}")
    name = factory.Sequence(lambda n: f"owner_{n}")
    credential = factory.SubFactory(CredentialFactory)


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = settings.AUTH_USER_MODEL

    id = factory.Sequence(lambda n: f"user_id_{n:04d}")
    email = factory.Faker("email")
