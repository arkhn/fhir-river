import pytest

pytestmark = pytest.mark.django_db


@pytest.mark.migration(app_label="pyrog", migration_name="0009_move_column_fk_on_input")
def test_migrate(migrator, state, input_factory, column_factory):
    input_1 = input_factory()
    input_1.static_value = "val"
    input_1.save()

    input_2 = input_factory()
    col = column_factory()
    input_2.column = col
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
