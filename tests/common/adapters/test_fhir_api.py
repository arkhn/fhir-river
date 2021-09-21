import pytest

from django.conf import settings

import requests
import responses
from common.adapters.fhir_api import HapiFhirAPI


def test_fhir_api():
    fhir_api = HapiFhirAPI()

    assert fhir_api._headers == {"Cache-Control": "no-cache", "Content-Type": "application/fhir+json"}


@responses.activate
@pytest.mark.parametrize(
    "auth_token,response,status",
    [("xxx-auth-token", {"ok": 1}, 200), ("xxx-auth-token", {"ok": 0}, 400), (None, "missing auth token", 503)],
)
def test_fhir_api_create(response, status, auth_token):
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
def test_fhir_api_validate(auth_token, response, status):
    resource_type = "Patient"
    responses.add(responses.POST, f"{settings.FHIR_API_URL}/{resource_type}/$validate", json=response, status=status)
    resp = HapiFhirAPI().validate(resource_type, {"id": "toto"}, "xxx-auth-token")
    assert len(responses.calls) == 1
    if auth_token:
        assert responses.calls[0].request.headers.get("Authorization") == f"Bearer {auth_token}"
    assert resp == response


@responses.activate
@pytest.mark.parametrize(
    "auth_token,response,status",
    [("xxx-auth-token", {"ok": 1}, 200), ("xxx-auth-token", {"ok": 0}, 400), (None, "missing auth token", 503)],
)
def test_fhr_api_retrieve(auth_token, response, status):
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
