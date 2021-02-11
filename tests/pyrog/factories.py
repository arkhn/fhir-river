import factory


class SourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Source"

    name = factory.Sequence(lambda n: f"source_{n}")
