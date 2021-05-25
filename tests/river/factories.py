import factory


class BatchFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "river.Batch"

    id = factory.Sequence(lambda n: f"batch_id_{n:04d}")


class ErrorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "river.Error"

    id = factory.Sequence(lambda n: f"batch_id_{n:04d}")
    batch = factory.SubFactory(BatchFactory)
