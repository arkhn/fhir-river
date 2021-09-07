from django.conf import settings

import requests


class FhirAPI:
    def __init__(self):
        self._headers = {"Cache-Control": "no-cache"}

    def get(self, path, auth_token=None):
        raise NotImplementedError


class HapiFhirAPI(FhirAPI):
    def __init__(self):
        super().__init__()
        self._url = settings.FHIR_API_URL

    def get(self, path, auth_token=None):
        headers = {**self._headers, "Authorization": f"Bearer {auth_token}"} if auth_token else self._headers
        response = requests.get(
            f"{self._url}{path}",
            headers=headers,
        )
        response.raise_for_status()
        return response.json()


fhir_api = settings.DEFAULT_FHIR_API_CLASS()
