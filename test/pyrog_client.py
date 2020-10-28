import os
import requests

from analyzer.src.errors import AuthenticationError, AuthorizationError, OperationOutcome

PYROG_API_URL = os.getenv("PYROG_API_URL")


class PyrogClient:
    def __init__(self, auth_header):
        self.headers = {
            "content-type": "application/json",
            "Authorization": auth_header,
        }

    def run_graphql_query(self, graphql_query, variables=None):
        """
        This function queries a GraphQL endpoint
        and returns a json parsed response.
        """
        if not PYROG_API_URL:
            raise OperationOutcome("PYROG_API_URL is missing from environment")

        try:
            response = requests.post(
                PYROG_API_URL,
                headers=self.headers,
                json={"query": graphql_query, "variables": variables},
            )
        except requests.exceptions.ConnectionError:
            raise OperationOutcome("Could not connect to the Pyrog service")

        if response.status_code != 200:
            raise Exception(
                "Graphql query failed with returning code "
                f"{response.status_code}\n{response.json()}."
            )
        body = response.json()
        if "errors" in body:
            status_code = body["errors"][0].get("statusCode")
            error_message = body["errors"][0].get("message")
            if status_code == 401:
                raise AuthenticationError(error_message)
            if status_code == 403:
                raise AuthorizationError("You don't have the rights to perform this action.")
            raise OperationOutcome(
                f"GraphQL query failed with errors: {[err['message'] for err in body['errors']]}."
            )

        return body
