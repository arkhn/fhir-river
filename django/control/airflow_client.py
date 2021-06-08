from django.conf import settings

import requests
from requests.auth import HTTPBasicAuth


class AirflowQueryStatusCodeException(Exception):
    pass


class AirflowClient:
    def get(self, route, **kwargs):
        response = requests.get(
            f"{settings.AIRFLOW_URL}/{route}",
            auth=HTTPBasicAuth(settings.AIRFLOW_USER, settings.AIRFLOW_PASSWORD),
            **kwargs,
        )
        return self._validate_response(response)

    def post(self, route, **kwargs):
        response = requests.post(
            f"{settings.AIRFLOW_URL}/{route}",
            auth=HTTPBasicAuth(settings.AIRFLOW_USER, settings.AIRFLOW_PASSWORD),
            **kwargs,
        )
        return self._validate_response(response)

    @staticmethod
    def _validate_response(response):
        if response.status_code != requests.codes["ok"]:
            raise AirflowQueryStatusCodeException

        return response
