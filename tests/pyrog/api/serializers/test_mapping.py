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
    assert Column.objects.count() == 2
    assert Condition.objects.count() == 2
    assert Filter.objects.count() == 2
    assert Join.objects.count() == 0

    # Assert that objects are truly referenced
    input_groups = InputGroup.objects.all()
    conditions = Condition.objects.all()
    resources = Resource.objects.all()
    attributes = Attribute.objects.all()
    columns = Column.objects.all()
    filters = Filter.objects.all()
    sql_inputs = SQLInput.objects.all()
    static_inputs = StaticInput.objects.all()
    assert set(resources) == set([a.resource for a in attributes])
    assert set(attributes) == set([ig.attribute for ig in input_groups])
    assert set(input_groups) == set([*(i.input_group for i in sql_inputs), *(i.input_group for i in static_inputs)])

    for f in filters:
        assert f.sql_column in columns
    for c in conditions:
        assert c.input_group in input_groups
    for f in filters:
        assert f.resource in resources
        assert f.sql_column in columns
