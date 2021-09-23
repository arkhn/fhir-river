import pytest

from django.conf import settings

import requests
import responses
from common.adapters.fhir_api import HapiFhirAPI, InMemoryFhirAPI


def test_inmemory_fhir_api_create():
    resource = {"deceased": "not yet"}

    fhir_api = InMemoryFhirAPI()
    created = fhir_api.create("Patient", resource)

    assert {**resource, "id": created["id"]} == created
    assert len(fhir_api._db["Patient"]) == 1

    fhir_api.create("Patient", resource)
    assert len(fhir_api._db["Patient"]) == 2


def test_inmemory_fhir_api_validate(snapshot):
    resource = {"deceased": "not yet"}

    fhir_api = InMemoryFhirAPI()
    res = fhir_api.validate("Patient", resource)
    assert res == snapshot


def test_inmemory_fhir_api_retrieve():
    resource = {"deceased": "not yet"}

    fhir_api = InMemoryFhirAPI()
    created = fhir_api.create("Patient", resource)
    res = fhir_api.retrieve("Patient", created["id"])
    assert res == created


@responses.activate
@pytest.mark.parametrize(
    "auth_token,response,status",
    [("xxx-auth-token", {"ok": 1}, 200), ("xxx-auth-token", {"ok": 0}, 400), (None, "missing auth token", 503)],
)
def test_hapi_fhir_api_create(response, status, auth_token):
    def call_and_assert():
        resp = HapiFhirAPI().create(resource_type, {"id": "toto"}, auth_token)
        assert len(responses.calls) == 1
        assert responses.calls[0].request.headers.get("Authorization") == f"Bearer {auth_token}"
        assert resp == response

    resource_type = "Patient"
    responses.add(responses.POST, f"{settings.FHIR_API_URL}/{resource_type}/", json=response, status=status)
    if status != 200:
        with pytest.raises(requests.exceptions.HTTPError):
            call_and_assert()
    else:
        call_and_assert()


@responses.activate
@pytest.mark.parametrize(
    "auth_token,response,status",
    [("xxx-auth-token", {"ok": 1}, 200), ("xxx-auth-token", {"ok": 0}, 400), (None, "missing auth token", 503)],
)
def test_hapi_fhir_api_validate(auth_token, response, status):
    resource_type = "Patient"
    responses.add(responses.POST, f"{settings.FHIR_API_URL}/{resource_type}/$validate", json=response, status=status)
    resp = HapiFhirAPI().validate(resource_type, {"id": "toto"}, "xxx-auth-token")
    assert len(responses.calls) == 1
    if auth_token:
        assert responses.calls[0].request.headers.get("Authorization") == f"Bearer {auth_token}"
    assert resp == response


@responses.activate
def test_hapi_fhir_api_validate_error(snapshot):
    resource_type = "Patient"

    def request_callback(request):
        return (500, {}, "500 internal server error")

    responses.add_callback(
        responses.POST, f"{settings.FHIR_API_URL}/{resource_type}/$validate", callback=request_callback
    )
    resp = HapiFhirAPI().validate(resource_type, {"id": "toto"}, "xxx-auth-token")
    assert len(responses.calls) == 1
    assert resp == snapshot


@responses.activate
@pytest.mark.parametrize(
    "auth_token,response,status",
    [("xxx-auth-token", {"ok": 1}, 200), ("xxx-auth-token", {"ok": 0}, 400), (None, "missing auth token", 503)],
)
def test_hapi_fhir_api_retrieve(auth_token, response, status):
    def call_and_assert():
        resp = HapiFhirAPI().retrieve(resource_type, resource_id, "xxx-auth-token")
        assert len(responses.calls) == 1
        assert responses.calls[0].request.headers.get("Authorization") == f"Bearer {auth_token}"
        assert resp == response

    resource_type = "Patient"
    resource_id = "resource-id"
    responses.add(
        responses.GET, f"{settings.FHIR_API_URL}/{resource_type}/{resource_id}", json=response, status=status
    )
    if status != 200:
        with pytest.raises(requests.exceptions.HTTPError):
            call_and_assert()
    else:
        call_and_assert()
