import json
from pathlib import Path

import factory

DATA_FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


def get_users_to_patients_mapping():
    with (DATA_FIXTURES_DIR / "users_to_patients_mapping.json").open() as f:
        return json.load(f)


class BatchFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "river.Batch"

    id = factory.Sequence(lambda n: f"batch_id_{n:04d}")
    mappings = factory.LazyFunction(lambda: [get_users_to_patients_mapping()])


class ErrorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "river.Error"

    id = factory.Sequence(lambda n: f"batch_id_{n:04d}")
    batch = factory.SubFactory(BatchFactory)
