import os
import requests

from analyzer.src.config.logger import create_logger
from analyzer.src.errors import OperationOutcome

logger = create_logger("analyzer")

PYROG_API_URL = os.getenv("PYROG_API_URL")
PYROG_LOGIN = os.getenv("PYROG_LOGIN")
PYROG_PASSWORD = os.getenv("PYROG_PASSWORD")

login_mutation = """
mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
  }
}
"""

attr_fragment = """
fragment entireFilter on Filter {
  id
  sqlColumn {
    id
    owner
    table
    column
  }
  relation
  value
}

fragment entireColumn on Column {
    owner
    table
    column
    joins {
        tables {
            owner
            table
            column
        }
    }
}

fragment entireInput on Input {
    sqlValue {
        ...entireColumn
    }
    script
    conceptMapId
    staticValue
}

fragment a on Attribute {
    path
    definitionId
    mergingScript
    inputs {
        ...entireInput
    }
}"""

cred_fragment = """
fragment cred on Credential {
    model
    host
    port
    database
    login
    password
}
"""

resource_from_id_query = """
%s

%s

query resource($resourceId: ID!) {
    resource(resourceId: $resourceId) {
        id
        primaryKeyOwner
        primaryKeyTable
        primaryKeyColumn
        definitionId
        definition {
            type
            kind
            derivation
            url
        }
        filters {
            ...entireFilter
        }
        attributes {
            ...a
        }
        source {
            id
            credential {
                ...cred
            }
        }
    }
}
""" % (
    attr_fragment,
    cred_fragment,
)


class PyrogClient:
    def __init__(self):
        self.token = self.login()
        logger.info("Login to pyrog was successful, token is %s", self.token)

    def get_headers(self, auth_required=True):
        if auth_required and not self.token:
            raise OperationOutcome(
                "PyrogClient is not authenticated (login has probably failed, check your logs)"
            )
        headers = {"content-type": "application/json"}
        if auth_required:
            headers["Authorization"] = f"Bearer {self.token}"

        return headers

    def run_graphql_query(self, graphql_query, variables=None, auth_required=True):
        """
        This function queries a GraphQL endpoint
        and returns a json parsed response.
        """
        if not PYROG_API_URL:
            raise OperationOutcome("PYROG_URL is missing from environment")

        try:
            response = requests.post(
                PYROG_API_URL,
                headers=self.get_headers(auth_required),
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
            raise Exception(f"GraphQL query failed with errors: {body['errors']}.")

        return body

    def login(self):
        if not PYROG_LOGIN or not PYROG_PASSWORD:
            raise OperationOutcome("PYROG_LOGIN and PYROG_PASSWORD are missing from environment")
        resp = self.run_graphql_query(
            login_mutation,
            variables={"email": PYROG_LOGIN, "password": PYROG_PASSWORD},
            auth_required=False,
        )
        data = resp["data"]
        if not data:
            raise OperationOutcome(
                f"Could not login to pyrog (email={PYROG_LOGIN}): {resp['errors'][0]['message']}"
            )

        return data["login"]["token"]

    def get_resource_from_id(self, resource_id):
        resp = self.run_graphql_query(resource_from_id_query, variables={"resourceId": resource_id})
        resource = resp["data"]["resource"]
        if not resource:
            raise OperationOutcome(f"Resource with id {resource_id} does not exist")
        return resource
