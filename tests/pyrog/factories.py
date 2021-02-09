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


class OwnerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Owner"

    credential = factory.SubFactory(CredentialFactory)
