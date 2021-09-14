from uuid import uuid4

from django.conf import settings
from django.utils.module_loading import import_string

import requests


class FhirAPI:
    def create(self, resource_type, payload, auth_token=None):
        raise NotImplementedError

    def validate(self, resource_type, payload, auth_token=None):
        raise NotImplementedError

    def retrieve(self, resource_type, resource_id, auth_token=None):
        raise NotImplementedError


class InMemoryFhirAPI(FhirAPI):
    def __init__(self):
        super().__init__()
        self._db = {}

    def create(self, resource_type: str, payload: dict, auth_token=None):
        resource = {"id": uuid4(), **payload}
        if isinstance(self._db.get(resource_type), list):
            self._db[resource_type] += [resource]
        else:
            self._db[resource_type] = [resource]
        return resource

    def validate(self, resource_type: str, payload: dict, auth_token=None):
        return {
            "resourceType": "OperationOutcome",
            "text": {
                "status": "generated",
                "div": "<p> it went fine bro </p>",
            },
            "issue": [],
        }

    def retrieve(self, resource_type, resource_id, auth_token=None):
        for resource in self._db.get(resource_type) or []:
            if resource["id"] == resource_id:
                return resource
        return None


class HapiFhirAPI(FhirAPI):
    def __init__(self):
        super().__init__()
        self._headers = {"Cache-Control": "no-cache", "Content-Type": "application/fhir+json"}
        self._url = settings.FHIR_API_URL

    def create(self, resource_type: str, payload: dict, auth_token=None):
        headers = {**self._headers, "Authorization": f"Bearer {auth_token}"} if auth_token else self._headers
        response = requests.post(
            f"{self._url}/{resource_type}/",
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        return response.json()

    def validate(self, resource_type: str, payload: dict, auth_token=None):
        headers = {**self._headers, "Authorization": f"Bearer {auth_token}"} if auth_token else self._headers
        response = requests.post(
            f"{self._url}/{resource_type}/$validate",
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        return response.json()

    def retrieve(self, resource_type, resource_id, auth_token=None):
        headers = {**self._headers, "Authorization": f"Bearer {auth_token}"} if auth_token else self._headers

        response = requests.get(
            f"{self._url}/{resource_type}/{resource_id}",
            headers=headers,
        )
        response.raise_for_status()
        return response.json()


fhir_api_class = import_string(settings.DEFAULT_FHIR_API_CLASS)

fhir_api = fhir_api_class()
