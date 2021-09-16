import pytest

from django.db import connection
from django.db.migrations.loader import MigrationLoader


@pytest.fixture
def state(request, migrator):
    marker = request.node.get_closest_marker("migration")
    target = (marker.kwargs["app_label"], marker.kwargs["migration_name"])
    migrator.apply_initial_migration(target)
    loader = MigrationLoader(connection)
    yield loader.project_state(target)
    migrator.reset()
