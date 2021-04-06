import pytest


@pytest.mark.django_db
@pytest.mark.migration_test
@pytest.mark.migration(app_label="pyrog", migration_name="0001_initial")
def test_migrate(migrator, state):
    Template = state.apps.get_model("pyrog", "Template")
    Source = state.apps.get_model("pyrog", "Source")

    t1 = Template.objects.create(name="template_1")
    t2 = Template.objects.create(name="template_2")

    s1 = Source.objects.create(template=t1, name="my_source")
    s2 = Source.objects.create(template=t2, name="my_source")

    try:
        migrator.apply_tested_migration(("pyrog", "0003_unique_source_name"))
    except Exception:
        pytest.fail()

    s1.refresh_from_db()
    s2.refresh_from_db()

    assert s1.name == "template_1 - my_source"
    assert s2.name == "template_2 - my_source"
