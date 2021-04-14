import pytest


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture(autouse=True)
def force_authenticate(request, api_client):
    """Automatically authenticate generated requests.

    Check ongoing test for the `as_user` or `as_other_user` marks. To use those marks,
    `user` and `other_user` must be available in the test scope.
    """
    if request.node.get_closest_marker("as_user"):
        user = request.getfixturevalue("user")
        api_client.force_authenticate(user)
    elif request.node.get_closest_marker("as_other_user"):
        other_user = request.getfixturevalue("other_user")
        api_client.force_authenticate(other_user)
