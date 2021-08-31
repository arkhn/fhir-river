import factory

from django.conf import settings

from pyrog import models


class SourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Source"

    id = factory.Sequence(lambda n: f"source_id_{n:04d}")
    name = factory.Sequence(lambda n: f"source_{n}")
    source_user = factory.RelatedFactory("tests.pyrog.factories.SourceUserFactory", factory_related_name="source")


class SourceUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.SourceUser"

    id = factory.Sequence(lambda n: f"source_user_id_{n:04d}")
    user = factory.SubFactory("tests.pyrog.factories.UserFactory")
    source = factory.SubFactory(SourceFactory)


class ResourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Resource"

    id = factory.Sequence(lambda n: f"resource_id_{n:04d}")
    source = factory.SubFactory(SourceFactory)
    primary_key_owner = factory.SubFactory("tests.pyrog.factories.OwnerFactory")


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


class AttributeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Attribute"

    id = factory.Sequence(lambda n: f"attribute_id_{n:04d}")
    resource = factory.SubFactory(ResourceFactory)


class InputGroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.InputGroup"

    id = factory.Sequence(lambda n: f"input_group_id_{n:04d}")
    attribute = factory.SubFactory(AttributeFactory)


class InputFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Input"

    id = factory.Sequence(lambda n: f"input_id_{n:04d}")
    input_group = factory.SubFactory(InputGroupFactory)


class ColumnFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Column"

    class Params:
        with_join = factory.Trait(join=factory.SubFactory("tests.pyrog.factories.JoinFactory"))

    id = factory.Sequence(lambda n: f"column_id_{n:04d}")
    input = factory.SubFactory(InputFactory)
    owner = factory.SubFactory("tests.pyrog.factories.OwnerFactory")


class JoinFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Join"

    id = factory.Sequence(lambda n: f"join_id_{n:04d}")
    column = factory.SubFactory(ColumnFactory)


class ConditionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Condition"

    id = factory.Sequence(lambda n: f"condition_id_{n:04d}")
    column = factory.SubFactory(ColumnFactory)
    input_group = factory.SubFactory(InputGroupFactory)


class FilterFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Filter"

    id = factory.Sequence(lambda n: f"filter_id_{n:04d}")
    resource = factory.SubFactory(ResourceFactory)
    sql_column = factory.SubFactory(ColumnFactory)


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
