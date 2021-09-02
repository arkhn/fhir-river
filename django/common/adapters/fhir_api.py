from django.conf import settings

import requests


class FhirAPI:
    def __init__(self, auth_token=None):
        self._auth_token = auth_token
        self._headers = (
            {"Cache-Control": "no-cache", "Authorization": f"Bearer {auth_token}"}
            if auth_token
            else {"Cache-Control": "no-cache"}
        )

    def get(self, path):
        raise NotImplementedError


class HapiFhirAPI(FhirAPI):
    def __init__(self, auth_token=None):
        super().__init__(auth_token)
        self._url = settings.FHIR_API_URL

    def get(self, path):
        response = requests.get(
            f"{self._url}{path}",
            headers=self._headers,
        )
        response.raise_for_status()
        return response.json()
