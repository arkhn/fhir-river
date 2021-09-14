import pytest

pytestmark = pytest.mark.django_db


@pytest.mark.migration(app_label="pyrog", migration_name="0012_drop_input")
def test_migrate(migrator, state, input_group_factory, column_factory, owner_factory):
    # instantiate all objects required for Condition and Filter
    Owner = state.apps.get_model("pyrog", "Owner")
    owner_factory()
    owner = Owner.objects.first()
    Source = state.apps.get_model("pyrog.Source")
    source = Source.objects.create(name="source")
    Resource = state.apps.get_model("pyrog.Resource")
    resource = Resource.objects.create(primary_key_owner=owner, source=source)
    InputGroup = state.apps.get_model("pyrog", "InputGroup")
    input_group_factory()
    group = InputGroup.objects.first()
    Owner = state.apps.get_model("pyrog", "Owner")
    owner_factory()
    owner = Owner.objects.first()
    Column = state.apps.get_model("pyrog", "Column")
    column_1 = Column.objects.create(owner=owner, table="table", column="col1")
    column_2 = Column.objects.create(owner=owner, table="table", column="col2")

    Condition = state.apps.get_model("pyrog", "Condition")
    condition = Condition.objects.create(input_group=group, column=column_1)

    Filter = state.apps.get_model("pyrog", "Filter")
    filter = Filter.objects.create(sql_column=column_2, resource=resource)

    new_state = migrator.apply_tested_migration(("pyrog", "0013_conditions_and_filters_sqlinput"))

    # assert that conditions and filters have references to sql_input
    SQLInput = new_state.apps.get_model("pyrog", "SQLInput")
    condition_sql_input = SQLInput.objects.get(condition=condition.id)
    assert condition_sql_input.column.id == column_1.id
    filter_sql_input = SQLInput.objects.get(filter=filter.id)
    assert filter_sql_input.column.id == column_2.id


@pytest.mark.migration(app_label="pyrog", migration_name="0013_conditions_and_filters_sqlinput")
def test_migrate_reverse(migrator, state, condition_factory, filter_factory):
    condition = condition_factory()
    filter = filter_factory()
    SQLInput = state.apps.get_model("pyrog", "SQLInput")
    assert len(SQLInput.objects.all()) == 2
    condition_input = SQLInput.objects.get(condition=condition.id)
    filter_input = SQLInput.objects.get(filter=filter.id)

    new_state = migrator.apply_tested_migration(("pyrog", "0012_drop_input"))

    SQLInput = new_state.apps.get_model("pyrog", "SQLInput")
    assert len(SQLInput.objects.all()) == 0

    Condition = new_state.apps.get_model("pyrog", "Condition")
    condition = Condition.objects.get(id=condition.id)
    assert condition.column.id == condition_input.column.id

    Filter = new_state.apps.get_model("pyrog", "Filter")
    filter = Filter.objects.get(id=filter.id)
    assert filter.sql_column.id == filter_input.column.id
