import pytest

pytestmark = pytest.mark.django_db


@pytest.mark.migration(app_label="pyrog", migration_name="0009_move_column_fk_on_input")
def test_migrate(migrator, state, input_group_factory, column_factory):
    InputGroup = state.apps.get_model("pyrog", "InputGroup")
    input_group_factory()
    group = InputGroup.objects.first()

    Input = state.apps.get_model("pyrog", "Input")
    input_1 = Input.objects.create(input_group=group)
    input_1.static_value = "val"
    input_1.save()

    input_2 = Input.objects.create(input_group=group)
    col = column_factory()
    input_2.column = state.apps.get_model("pyrog", "Column").objects.first()
    input_2.save()

    try:
        new_state = migrator.apply_tested_migration(("pyrog", "0010_split_static_and_sql_inputs"))
    except Exception:
        pytest.fail()

    StaticInput = new_state.apps.get_model("pyrog", "StaticInput")
    static_inputs = StaticInput.objects.all()
    assert len(static_inputs) == 1
    assert static_inputs[0].value == "val"

    SQLInput = new_state.apps.get_model("pyrog", "SQLInput")
    sql_inputs = SQLInput.objects.all()
    assert len(sql_inputs) == 1
    assert sql_inputs[0].column.id == col.id


@pytest.mark.migration(app_label="pyrog", migration_name="0010_split_static_and_sql_inputs")
def test_migrate_reverse(migrator, state, static_input_factory, sql_input_factory):
    static_input = static_input_factory()
    static_input.value = "val"
    static_input.save()
    sql_input = sql_input_factory()

    try:
        new_state = migrator.apply_tested_migration(("pyrog", "0009_move_column_fk_on_input"))
    except Exception:
        pytest.fail()

    Input = new_state.apps.get_model("pyrog", "Input")
    inputs = Input.objects.all()
    assert len(inputs) == 2
    assert inputs[0].static_value == "val"
    assert inputs[1].column.id == sql_input.column.id
