import pytest

from django.conf import settings

pytestmark = pytest.mark.django_db


def create_sql_input(state):
    Credential = state.apps.get_model("pyrog.Credential")
    Owner = state.apps.get_model("pyrog.Owner")
    InputGroup = state.apps.get_model("pyrog.InputGroup")
    SQLInput = state.apps.get_model("pyrog.SQLInput")
    Resource = state.apps.get_model("pyrog.Resource")
    Attribute = state.apps.get_model("pyrog.Attribute")
    Source = state.apps.get_model("pyrog.Source")
    Column = state.apps.get_model("pyrog", "Column")

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
    base_col = Column.objects.create(owner=owner, table="table", column="col1")
    sql_input = SQLInput.objects.create(input_group=input_group, column=base_col)
    return sql_input


@pytest.mark.migration(app_label="pyrog", migration_name="0013_conditions_and_filters_sqlinput")
def test_migrate(migrator, state):
    Owner = state.apps.get_model("pyrog.Owner")
    Join = state.apps.get_model("pyrog", "Join")
    Column = state.apps.get_model("pyrog", "Column")

    sql_input = create_sql_input(state)

    join = Join.objects.create(column=sql_input.column)
    left_col = Column.objects.create(owner=Owner.objects.first(), table="table", column="col_left", join=join)
    right_col = Column.objects.create(owner=Owner.objects.first(), table="table", column="col_right", join=join)

    new_state = migrator.apply_tested_migration(("pyrog", "0014_split_join_left_right"))

    Join = new_state.apps.get_model("pyrog", "Join")
    new_joins = Join.objects.all()
    assert len(new_joins) == 1
    assert new_joins[0].left.id == left_col.id
    assert new_joins[0].right.id == right_col.id
    assert new_joins[0].sql_input.id == sql_input.id


@pytest.mark.migration(app_label="pyrog", migration_name="0014_split_join_left_right")
def test_migrate_reverse(migrator, state):
    Owner = state.apps.get_model("pyrog.Owner")
    Join = state.apps.get_model("pyrog", "Join")
    Column = state.apps.get_model("pyrog", "Column")

    sql_input = create_sql_input(state)

    left_col = Column.objects.create(owner=Owner.objects.first(), table="table", column="col_left")
    right_col = Column.objects.create(owner=Owner.objects.first(), table="table", column="col_right")
    join = Join.objects.create(sql_input=sql_input, left=left_col, right=right_col)

    new_state = migrator.apply_tested_migration(("pyrog", "0013_conditions_and_filters_sqlinput"))

    Join = new_state.apps.get_model("pyrog", "Join")
    new_joins = Join.objects.all()
    assert len(new_joins) == 1
    assert new_joins[0].column.id == join.sql_input.column.id
    new_join_columns = new_joins[0].columns.all()
    assert new_join_columns[0].id == join.left.id
    assert new_join_columns[1].id == join.right.id
