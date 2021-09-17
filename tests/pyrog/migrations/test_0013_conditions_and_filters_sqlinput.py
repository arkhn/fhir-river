import pytest

from django.conf import settings

pytestmark = pytest.mark.django_db


def create_input_group(state):
    Owner = state.apps.get_model("pyrog.Owner")
    InputGroup = state.apps.get_model("pyrog.InputGroup")
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
    return input_group


@pytest.mark.migration(app_label="pyrog", migration_name="0012_drop_input")
def test_migrate(migrator, state):
    Owner = state.apps.get_model("pyrog.Owner")
    Resource = state.apps.get_model("pyrog.Resource")
    Column = state.apps.get_model("pyrog.Column")
    Condition = state.apps.get_model("pyrog", "Condition")
    Filter = state.apps.get_model("pyrog", "Filter")

    input_group = create_input_group(state)

    column_1 = Column.objects.create(owner=Owner.objects.first(), table="table", column="col1")
    column_2 = Column.objects.create(owner=Owner.objects.first(), table="table", column="col2")
    condition = Condition.objects.create(input_group=input_group, column=column_1)
    filter = Filter.objects.create(sql_column=column_2, resource=Resource.objects.first())

    new_state = migrator.apply_tested_migration(("pyrog", "0013_conditions_and_filters_sqlinput"))

    # assert that conditions and filters have references to sql_input
    SQLInput = new_state.apps.get_model("pyrog", "SQLInput")
    condition_sql_input = SQLInput.objects.get(condition=condition.id)
    assert condition_sql_input.column.id == column_1.id
    filter_sql_input = SQLInput.objects.get(filter=filter.id)
    assert filter_sql_input.column.id == column_2.id


@pytest.mark.migration(app_label="pyrog", migration_name="0013_conditions_and_filters_sqlinput")
def test_migrate_reverse(migrator, state):
    Owner = state.apps.get_model("pyrog.Owner")
    Resource = state.apps.get_model("pyrog.Resource")
    Column = state.apps.get_model("pyrog.Column")
    Condition = state.apps.get_model("pyrog", "Condition")
    Filter = state.apps.get_model("pyrog", "Filter")
    SQLInput = state.apps.get_model("pyrog", "SQLInput")

    input_group = create_input_group(state)
    column_1 = Column.objects.create(owner=Owner.objects.first(), table="table", column="col1")
    column_2 = Column.objects.create(owner=Owner.objects.first(), table="table", column="col2")
    sql_input_1 = SQLInput.objects.create(input_group=input_group, column=column_1)
    sql_input_2 = SQLInput.objects.create(input_group=input_group, column=column_2)
    condition = Condition.objects.create(input_group=input_group, sql_input=sql_input_1)
    filter = Filter.objects.create(sql_input=sql_input_2, resource=Resource.objects.first())

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
