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


def test_inmemory_fhir_api_retrieve():
    resource = {"deceased": "not yet"}

    fhir_api = InMemoryFhirAPI()
    created = fhir_api.create("Patient", resource)
    res = fhir_api.retrieve("Patient", created["id"])
    assert res == created


@responses.activate
def test_hapi_fhir_api_create():
    resource_type = "Patient"
    responses.add(responses.POST, f"{settings.FHIR_API_URL}/{resource_type}/", json={"ok": 1}, status=200)
    resp = HapiFhirAPI().create(resource_type, {"id": "toto"}, "xxx-auth-token")
    assert len(responses.calls) == 1
    assert responses.calls[0].request.headers.get("Authorization") == "xxx-auth-token"
    assert resp == {"ok": 1}


@responses.activate
@pytest.mark.parametrize("auth_token,status", [("xxx-auth-token", 400), (None, 503)])
def test_hapi_fhir_api_create_failure(status, auth_token):
    resource_type = "Patient"
    responses.add(responses.POST, f"{settings.FHIR_API_URL}/{resource_type}/", status=status)
    with pytest.raises(requests.exceptions.HTTPError):
        HapiFhirAPI().create(resource_type, {"id": "toto"}, auth_token)
    assert len(responses.calls) == 1
    if auth_token:
        assert responses.calls[0].request.headers.get("Authorization") == f"{auth_token}"


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
        assert responses.calls[0].request.headers.get("Authorization") == f"{auth_token}"
    assert resp == response


@responses.activate
def test_hapi_fhir_api_validate_failure():
    resource_type = "Patient"

    def request_callback(request):
        return (500, {}, "500 internal server error")

    responses.add_callback(
        responses.POST, f"{settings.FHIR_API_URL}/{resource_type}/$validate", callback=request_callback
    )
    resp = HapiFhirAPI().validate(resource_type, {"id": "toto"}, "xxx-auth-token")
    assert len(responses.calls) == 1
    assert resp == {
        "resourceType": "OperationOutcome",
        "issue": [{"severity": "error", "code": "", "diagnostics": "500 internal server error"}],
    }


@responses.activate
def test_hapi_fhir_api_retrieve():
    resource_type = "Patient"
    resource_id = "resource-id"
    responses.add(responses.GET, f"{settings.FHIR_API_URL}/{resource_type}/{resource_id}", json={"ok": 1}, status=200)
    resp = HapiFhirAPI().retrieve(resource_type, resource_id, "xxx-auth-token")
    assert len(responses.calls) == 1
    assert responses.calls[0].request.headers.get("Authorization") == "xxx-auth-token"
    assert resp == {"ok": 1}


@responses.activate
@pytest.mark.parametrize("auth_token,status", [("xxx-auth-token", 400), (None, 503)])
def test_hapi_fhir_api_retrieve_failure(auth_token, status):
    resource_type = "Patient"
    resource_id = "resource-id"
    responses.add(responses.GET, f"{settings.FHIR_API_URL}/{resource_type}/{resource_id}", status=status)
    with pytest.raises(requests.exceptions.HTTPError):
        HapiFhirAPI().retrieve(resource_type, resource_id, "xxx-auth-token")
    assert len(responses.calls) == 1
    if auth_token:
        assert responses.calls[0].request.headers.get("Authorization") == f"{auth_token}"
