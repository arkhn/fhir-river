import pytest


@pytest.fixture
def state(request, migrator):
    marker = request.node.get_closest_marker("migration")
    target = (marker.kwargs["app_label"], marker.kwargs["migration_name"])
    return migrator.apply_initial_migration(target)
