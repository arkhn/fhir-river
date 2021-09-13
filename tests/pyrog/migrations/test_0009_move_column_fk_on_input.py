import pytest

from django.conf import settings

pytestmark = pytest.mark.django_db


@pytest.mark.migration(app_label="pyrog", migration_name="0008_column_ordering")
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
    input_ = Input.objects.create(input_group=input_group)
    Column.objects.create(owner=owner, table="table", column="column", input=input_)

    new_state = migrator.apply_tested_migration(("pyrog", "0009_move_column_fk_on_input"))

    Input = new_state.apps.get_model("pyrog.Input")
    inputs = Input.objects.all()

    assert len(inputs) == 1
    assert inputs[0].column.table == "table"
    assert inputs[0].column.column == "column"


@pytest.mark.migration(app_label="pyrog", migration_name="0009_move_column_fk_on_input")
def test_migrate_reverse(migrator, state):
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
    input_ = Input.objects.create(input_group=input_group, column=column)

    new_state = migrator.apply_tested_migration(("pyrog", "0008_column_ordering"))

    Column = new_state.apps.get_model("pyrog", "Column")
    columns = Column.objects.all()

    assert len(columns) == 1
    assert columns[0].input.id == input_.id
