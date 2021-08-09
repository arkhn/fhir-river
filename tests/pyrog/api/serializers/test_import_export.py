import json

import pytest

from pyrog.api.serializers.import_export import MappingSerializer
from pyrog.models import Attribute, Column, Condition, Filter, Input, InputGroup, Join, Resource, Source

pytestmark = pytest.mark.django_db


def test_validation(valid_export_data):
    serializer = MappingSerializer(data=valid_export_data)
    if serializer.is_valid() is False:
        pytest.fail(json.dumps(serializer.errors))


def test_validation_error(invalid_export_data):
    serializer = MappingSerializer(data=invalid_export_data)
    if serializer.is_valid() is True:
        pytest.fail()


@pytest.mark.export_data("valid/0005.json")
def test_create(export_data):
    serializer = MappingSerializer(data=export_data)
    serializer.is_valid()
    serializer.save()

    assert Source.objects.count() == 1
    assert Resource.objects.count() == 2
    assert Attribute.objects.count() == 2
    assert InputGroup.objects.count() == 2
    assert Input.objects.count() == 2
    assert Column.objects.count() == 2
    assert Condition.objects.count() == 2
    assert Filter.objects.count() == 2
    assert Join.objects.count() == 0

    # Assert that objects are truly referenced
    assert set(Resource.objects.all()) == set([a.resource for a in Attribute.objects.all()])
    assert set(Attribute.objects.all()) == set([ig.attribute for ig in InputGroup.objects.all()])
    assert set(InputGroup.objects.all()) == set([i.input_group for i in Input.objects.all()])
    assert set(Column.objects.all()) == set([i.column for i in Input.objects.all()])
    assert set(Column.objects.all()) == set([c.column for c in Condition.objects.all()])
    assert set(InputGroup.objects.all()) == set([c.input_group for c in Condition.objects.all()])
    assert set(Resource.objects.all()) == set([f.resource for f in Filter.objects.all()])
    assert set(Column.objects.all()) == set([f.sql_column for f in Filter.objects.all()])
