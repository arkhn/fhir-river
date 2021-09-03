import pytest

pytestmark = pytest.mark.django_db


@pytest.mark.migration(app_label="pyrog", migration_name="0008_column_ordering")
def test_migrate(migrator, state, owner_factory, input_group_factory):
    Owner = state.apps.get_model("pyrog", "Owner")
    InputGroup = state.apps.get_model("pyrog", "InputGroup")
    Column = state.apps.get_model("pyrog", "Column")
    Input = state.apps.get_model("pyrog", "Input")

    owner_factory()
    input_group_factory()
    owner = Owner.objects.first()
    group = InputGroup.objects.first()

    input = Input.objects.create(input_group=group)
    _ = Column.objects.create(owner=owner, table="table", column="column", input=input)

    new_state = migrator.apply_tested_migration(("pyrog", "0009_move_column_fk_on_input"))

    Input = new_state.apps.get_model("pyrog", "Input")
    inputs = Input.objects.all()

    assert len(inputs) == 1
    assert inputs[0].column.table == "table"
    assert inputs[0].column.column == "column"


@pytest.mark.migration(app_label="pyrog", migration_name="0009_move_column_fk_on_input")
def test_migrate_reverse(migrator, state, input_factory, column_factory):
    input = input_factory()
    column = column_factory()

    input.column = column
    input.save()

    new_state = migrator.apply_tested_migration(("pyrog", "0008_column_ordering"))

    Column = new_state.apps.get_model("pyrog", "Column")
    columns = Column.objects.all()

    assert len(columns) == 1
    assert columns[0].input.id == input.id
