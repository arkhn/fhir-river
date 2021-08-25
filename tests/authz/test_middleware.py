from typing import List

import pytest

from django.http import HttpResponse

from authz import AuthzBackend, AuthzMiddleware, Operation

pytestmark = pytest.mark.django_db


def get_response(*args, **kwargs):
    return HttpResponse()


class FakeAuthzBackend(AuthzBackend):
    def __init__(self, permissions: List[tuple]):
        self._permissions = permissions

    def validate(self, user_email: str, resource: str, operation: Operation) -> bool:
        return (user_email, resource, operation) in self._permissions


@pytest.mark.parametrize(
    ("path", "method", "status_code"),
    [
        ("/api/sources/", "GET", 200),
        ("/api/sources/", "POST", 200),
        ("/api/sources/", "DELETE", 403),  # Has not been granted
        ("/api/resources/", "GET", 403),  # Other resource
        ("/admin/", "GET", 200),  # Does not match given `url_pattern`
    ],
)
def test_can_validate_authz(rf, settings, user, path, method, status_code):
    backend = FakeAuthzBackend(
        permissions=[
            (user.email, "/api/sources/", Operation.READ),
            (user.email, "/api/sources/", Operation.CREATE),
        ]
    )
    middleware = AuthzMiddleware(get_response=get_response, backend=backend, url_pattern=r"/api/.*")
    request = rf.generic(method, path)
    request.user = user

    response = middleware(request)

    assert response.status_code == status_code
