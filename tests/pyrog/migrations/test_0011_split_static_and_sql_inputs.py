import pytest

from django.conf import settings

pytestmark = pytest.mark.django_db


@pytest.mark.migration(app_label="pyrog", migration_name="0010_resource_definition")
def test_migrate(migrator, state):
    Owner = state.apps.get_model("pyrog.Owner")
    InputGroup = state.apps.get_model("pyrog.InputGroup")
    Column = state.apps.get_model("pyrog.Column")
    Input = state.apps.get_model("pyrog.Input")
    Resource = state.apps.get_model("pyrog.Resource")
    Attribute = state.apps.get_model("pyrog.Attribute")
    Source = state.apps.get_model("pyrog.Source")
    Credential = state.apps.get_model("pyrog.Credential")

    source = Source.objects.create(name="source")
    credential = Credential.objects.create(
        source=source,
        host=settings.DATABASES["default"]["HOST"],
        port=settings.DATABASES["default"]["PORT"],
        database=settings.DATABASES["default"]["NAME"],
        login=settings.DATABASES["default"]["USER"],
        password=settings.DATABASES["default"]["PASSWORD"],
        model="POSTGRES",
    )
    owner = Owner.objects.create(name="owner", credential=credential)
    resource = Resource.objects.create(primary_key_owner=owner, source=source)
    attribute = Attribute.objects.create(resource=resource)
    input_group = InputGroup.objects.create(attribute=attribute)
    column = Column.objects.create(owner=owner, table="table", column="column")
    Input.objects.create(input_group=input_group, column=column, script="script", concept_map_id="concept_map_id")
    Input.objects.create(input_group=input_group, static_value="value")

    new_state = migrator.apply_tested_migration(("pyrog", "0011_split_static_and_sql_inputs"))

    StaticInput = new_state.apps.get_model("pyrog", "StaticInput")
    static_inputs = StaticInput.objects.all()
    assert len(static_inputs) == 1
    assert static_inputs[0].value == "value"

    SQLInput = new_state.apps.get_model("pyrog", "SQLInput")
    sql_inputs = SQLInput.objects.all()
    assert len(sql_inputs) == 1
    assert sql_inputs[0].column.id == column.id
    assert sql_inputs[0].script == "script"
    assert sql_inputs[0].concept_map_id == "concept_map_id"


@pytest.mark.migration(app_label="pyrog", migration_name="0011_split_static_and_sql_inputs")
def test_migrate_reverse(migrator, state):
    Owner = state.apps.get_model("pyrog.Owner")
    InputGroup = state.apps.get_model("pyrog.InputGroup")
    Column = state.apps.get_model("pyrog.Column")
    StaticInput = state.apps.get_model("pyrog.StaticInput")
    SQLInput = state.apps.get_model("pyrog.SQLInput")
    Resource = state.apps.get_model("pyrog.Resource")
    Attribute = state.apps.get_model("pyrog.Attribute")
    Source = state.apps.get_model("pyrog.Source")
    Credential = state.apps.get_model("pyrog.Credential")

    source = Source.objects.create(name="source")
    credential = Credential.objects.create(
        source=source,
        host=settings.DATABASES["default"]["HOST"],
        port=settings.DATABASES["default"]["PORT"],
        database=settings.DATABASES["default"]["NAME"],
        login=settings.DATABASES["default"]["USER"],
        password=settings.DATABASES["default"]["PASSWORD"],
        model="POSTGRES",
    )
    owner = Owner.objects.create(name="owner", credential=credential)
    resource = Resource.objects.create(primary_key_owner=owner, source=source)
    attribute = Attribute.objects.create(resource=resource)
    input_group = InputGroup.objects.create(attribute=attribute)
    column = Column.objects.create(owner=owner, table="table", column="column")
    StaticInput.objects.create(input_group=input_group, value="value")
    sql_input = SQLInput.objects.create(
        input_group=input_group, column=column, script="script", concept_map_id="concept_map_id"
    )

    new_state = migrator.apply_tested_migration(("pyrog", "0010_resource_definition"))

    Input = new_state.apps.get_model("pyrog", "Input")
    inputs = Input.objects.all()
    assert len(inputs) == 2
    assert inputs[0].static_value == "value"
    assert inputs[1].column.id == sql_input.column.id
