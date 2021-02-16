import factory


class SourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Source"

    name = factory.Sequence(lambda n: f"source_{n}")


class ResourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Resource"

    source = factory.SubFactory(SourceFactory)
    primary_key_owner = factory.SubFactory("tests.pyrog.factories.OwnerFactory")


class CredentialFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Credential"

    source = factory.SubFactory(SourceFactory)
    port = 5432


class AttributeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Attribute"

    resource = factory.SubFactory(ResourceFactory)


class InputGroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.InputGroup"

    attribute = factory.SubFactory(AttributeFactory)


class InputFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Input"

    input_group = factory.SubFactory(InputGroupFactory)


class ColumnFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Column"

    class Params:
        with_join = factory.Trait(join=factory.SubFactory("tests.pyrog.factories.JoinFactory"))

    input = factory.SubFactory(InputFactory)
    owner = factory.SubFactory("tests.pyrog.factories.OwnerFactory")


class JoinFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Join"

    column = factory.SubFactory(ColumnFactory)


class ConditionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Condition"

    column = factory.SubFactory(ColumnFactory)
    input_group = factory.SubFactory(InputGroupFactory)


class FilterFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Filter"

    resource = factory.SubFactory(ResourceFactory)
    sql_column = factory.SubFactory(ColumnFactory)


class OwnerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Owner"

    credential = factory.SubFactory(CredentialFactory)
