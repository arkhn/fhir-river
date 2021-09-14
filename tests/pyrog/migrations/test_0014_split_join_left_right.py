import pytest

pytestmark = pytest.mark.django_db


@pytest.mark.migration(app_label="pyrog", migration_name="0013_conditions_and_filters_sqlinput")
def test_migrate(migrator, state, owner_factory, sql_input_factory):
    Owner = state.apps.get_model("pyrog", "Owner")
    Join = state.apps.get_model("pyrog", "Join")
    Column = state.apps.get_model("pyrog", "Column")
    SQLInput = state.apps.get_model("pyrog", "SQLInput")

    owner_factory()
    owner = Owner.objects.first()
    sql_input_factory()
    sql_input = SQLInput.objects.first()

    base_col = Column.objects.create(owner=owner, table="table", column="col1")
    sql_input.column = base_col
    sql_input.save()

    join = Join.objects.create(column=base_col)
    left_col = Column.objects.create(owner=owner, table="table", column="col_left", join=join)
    right_col = Column.objects.create(owner=owner, table="table", column="col_right", join=join)

    try:
        new_state = migrator.apply_tested_migration(("pyrog", "0014_split_join_left_right"))
    except Exception:
        pytest.fail()

    Join = new_state.apps.get_model("pyrog", "Join")
    new_joins = Join.objects.all()
    assert len(new_joins) == 1
    assert new_joins[0].left.id == left_col.id
    assert new_joins[0].right.id == right_col.id
    assert new_joins[0].sql_input.id == sql_input.id


@pytest.mark.migration(app_label="pyrog", migration_name="0014_split_join_left_right")
def test_migrate_reverse(migrator, state, join_factory):
    join = join_factory()

    try:
        new_state = migrator.apply_tested_migration(("pyrog", "0013_conditions_and_filters_sqlinput"))
    except Exception:
        pytest.fail()

    Join = new_state.apps.get_model("pyrog", "Join")
    new_joins = Join.objects.all()
    assert len(new_joins) == 1
    assert new_joins[0].column.id == join.sql_input.column.id
    new_join_columns = new_joins[0].columns.all()
    assert new_join_columns[0].id == join.left.id
    assert new_join_columns[1].id == join.right.id
