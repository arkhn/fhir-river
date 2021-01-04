import logging
import requests
from requests.adapters import HTTPAdapter
from typing import Optional
from urllib3.util import Retry

logger = logging.getLogger()


def log_and_raise(resp: requests.Response, *args, **kwargs):
    try:
        resp.raise_for_status()
    except requests.HTTPError as err:
        logger.error(resp.text)
        raise err


class BaseAPIClient:
    def __init__(
        self, base_url: str, session: Optional[requests.Session] = None
    ) -> None:
        self.base_url = base_url
        self._session = session or requests.Session()
        adapter = HTTPAdapter(
            max_retries=Retry(
                total=3, backoff_factor=10, status_forcelist=[429, 500, 502, 503, 504]
            )
        )
        self._session.mount("http", adapter)
        self._session.hooks["response"] = [log_and_raise]
