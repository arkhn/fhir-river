import factory


class TemplateFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Template"

    name = factory.Sequence(lambda n: f"template_{n}")


class SourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "pyrog.Source"

    template = factory.SubFactory(TemplateFactory)
    name = factory.Sequence(lambda n: f"source_{n}")
