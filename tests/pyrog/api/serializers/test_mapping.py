import json

import pytest

from pyrog.api.serializers.mapping import MappingSerializer
from pyrog.models import (
    Attribute,
    Column,
    Condition,
    Filter,
    InputGroup,
    Join,
    Resource,
    Source,
    SQLInput,
    StaticInput,
)

pytestmark = pytest.mark.django_db


def test_validation(valid_export_data):
    serializer = MappingSerializer(data=valid_export_data)
    if serializer.is_valid() is False:
        pytest.fail(json.dumps(serializer.errors))


def test_validation_error(invalid_export_data):
    serializer = MappingSerializer(data=invalid_export_data)
    if serializer.is_valid() is True:
        pytest.fail()


@pytest.mark.export_data("valid/different-owners.json")
def test_create(export_data):
    serializer = MappingSerializer(data=export_data)
    if not serializer.is_valid():
        pytest.fail(json.dumps(serializer.errors))
    serializer.save()

    assert Source.objects.count() == 1
    assert Resource.objects.count() == 2
    assert Attribute.objects.count() == 2
    assert InputGroup.objects.count() == 3
    assert SQLInput.objects.count() == 2
    assert StaticInput.objects.count() == 1
    assert Column.objects.count() == 5
    assert Condition.objects.count() == 3
    assert Filter.objects.count() == 3
    assert Join.objects.count() == 1

    # Assert that objects are truly referenced
    # FIXME can we improve that?
    assert set(Resource.objects.all()) == set([a.resource for a in Attribute.objects.all()])
    assert set(Attribute.objects.all()) == set([ig.attribute for ig in InputGroup.objects.all()])
    assert set(InputGroup.objects.all()) == set(
        [*(i.input_group for i in SQLInput.objects.all()), *(i.input_group for i in StaticInput.objects.all())]
    )
    assert set(Column.objects.all()) == set(
        [
            *(c.column for c in Condition.objects.all()),
            *(j.left for j in Join.objects.all()),
            *(j.right for j in Join.objects.all()),
        ]
    )
    assert set(InputGroup.objects.all()) == set([c.input_group for c in Condition.objects.all()])
    assert set(Resource.objects.all()) == set([f.resource for f in Filter.objects.all()])
