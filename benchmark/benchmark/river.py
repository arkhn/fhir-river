import logging
import requests
from typing import Optional

from benchmark.utils.api import BaseAPIClient

logger = logging.getLogger(__name__)


class APIClient(BaseAPIClient):
    def __init__(
        self,
        base_url: str,
        session: Optional[requests.Session] = None,
    ):
        super().__init__(base_url=base_url, session=session)

    def batch(self, resources):
        logger.debug("Sending batch request.")
        data = {"resources": resources}
        self._session.post(f"{self.base_url}/batch", json=data)
