import pytest

from django.conf import settings
from django.db import models

pytestmark = pytest.mark.django_db


@pytest.mark.migration(app_label="pyrog", migration_name="0014_split_join_left_right")
def test_migrate(migrator, state):
    Credential = state.apps.get_model("pyrog.Credential")
    Owner = state.apps.get_model("pyrog.Owner")
    Resource = state.apps.get_model("pyrog.Resource")
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
    Resource.objects.create(primary_key_owner=owner, source=source)
    Column.objects.create(owner=owner, table="table", column="col1")

    new_state = migrator.apply_tested_migration(("pyrog", "0015_restrict_on_delete_owner"))

    Owner = new_state.apps.get_model("pyrog.Owner")
    with pytest.raises(models.deletion.RestrictedError):
        Owner.objects.get(id=owner.id).delete()
