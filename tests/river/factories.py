from pathlib import Path

import factory

from tests.conftest import load_mapping

DATA_FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def mimic_mapping():
    return load_mapping(DATA_FIXTURES_DIR / "mimic_mapping.json")


class BatchFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "river.Batch"

    id = factory.Sequence(lambda n: f"batch_id_{n:04d}")
    mappings = factory.LazyAttribute(lambda x: mimic_mapping())

    @factory.post_generation
    def resources(self, create, extracted, **kwargs):
        """resources is a callable that links the Batch and Resource models.

        https://factoryboy.readthedocs.io/en/stable/recipes.html#simple-many-to-many-relationship
        """

        if not create or not extracted:
            return

        self.resources.add(*extracted)


class ErrorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "river.Error"

    id = factory.Sequence(lambda n: f"batch_id_{n:04d}")
    batch = factory.SubFactory(BatchFactory)


class ProgressionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "river.Progression"

    id = factory.Sequence(lambda n: f"progression_id_{n:04d}")
    extracted = 100
    loaded = 50
    failed = None
