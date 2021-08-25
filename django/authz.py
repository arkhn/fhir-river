import enum
import logging
import re

from django import http
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils.module_loading import import_string

import requests

logger = logging.getLogger(__name__)


class Operation(enum.Enum):
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


HTTP_METHOD_TO_OPERATION = {
    "GET": Operation.READ,
    "POST": Operation.CREATE,
    "PUT": Operation.UPDATE,
    "DELETE": Operation.DELETE,
}


class AuthzBackend:
    def validate(self, user_email: str, resource: str, operation: Operation) -> bool:
        raise NotImplementedError


class RemoteAuthzBackend(AuthzBackend):
    def __init__(self):
        super().__init__()

        if settings.AUTHZ_MIDDLEWARE_ENABLED and settings.AUTHZ_MIDDLEWARE_ENDPOINT is None:
            raise ImproperlyConfigured("AUTHZ_MIDDLEWARE_ENDPOINT is not set.")

        if settings.AUTHZ_MIDDLEWARE_ENABLED and settings.AUTHZ_MIDDLEWARE_SERVICE_NAME is None:
            raise ImproperlyConfigured("AUTHZ_MIDDLEWARE_SERVICE_NAME is not set.")

    def validate(self, user_email: str, resource: str, operation: Operation) -> bool:
        data = {
            "user_email": user_email,
            "service_name": settings.AUTHZ_MIDDLEWARE_SERVICE_NAME,
            "resource": resource,
            "requested_operation": operation.value,
        }

        response = requests.post(settings.AUTHZ_MIDDLEWARE_ENDPOINT, data=data)
        result = response.json()["authorized"]

        logger.info(f"{'Successful' if result else 'Failed'} authz request for {data}")

        return result


class AuthzMiddleware:
    def __init__(self, get_response, backend: AuthzBackend = None, url_pattern: str = None):
        self.get_response = get_response
        self._backend = backend or import_string(settings.AUTHZ_MIDDLEWARE_BACKEND)()
        self._url_pattern = re.compile(url_pattern or settings.AUTHZ_MIDDLEWARE_URL_PATTERN)

    def __call__(self, request: http.HttpRequest):
        if not self.is_exempt(request) and not self._backend.validate(
            self.get_user_email(request),
            self.get_resource(request),
            self.get_operation(request),
        ):
            logger.info(f"Authz failed for {request}")
            return http.HttpResponse(status=403)

        return self.get_response(request)

    def get_user_email(self, request: http.HttpRequest) -> str:
        return request.user.email

    def get_operation(self, request: http.HttpRequest) -> Operation:
        return HTTP_METHOD_TO_OPERATION[request.method]

    def get_resource(self, request: http.HttpRequest) -> str:
        return request.get_full_path()

    def is_exempt(self, request) -> bool:
        return (
            not settings.AUTHZ_MIDDLEWARE_ENABLED
            or not request.user.is_authenticated
            or self._url_pattern.match(request.path) is None
        )