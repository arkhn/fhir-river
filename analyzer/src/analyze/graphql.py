import os
import requests

from analyzer.src.errors import OperationOutcome


PYROG_API_URL = os.getenv("PYROG_API_URL")

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
    table
    column
  }
  relation
  value
}

fragment entireColumn on Column {
    table
    column
    joins {
        tables {
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

fragment entireCondition on Condition {
    action
    sqlValue {
        table
        column
    }
    relation
    value
}

fragment entireInputGroup on InputGroup {
    id
    mergingScript
    inputs {
        ...entireInput
    }
    conditions {
        ...entireCondition
    }
}

fragment a on Attribute {
    path
    definitionId
    inputGroups {
        ...entireInputGroup
    }
}"""

cred_fragment = """
fragment cred on Credential {
    model
    host
    port
    database
    owner
    login
    password: decryptedPassword
}
"""

resource_from_id_query = """
%s

%s

query resource($resourceId: ID!) {
    resource(resourceId: $resourceId) {
        id
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
    def __init__(self, auth_header, id_token):
        self.headers = {
            "content-type": "application/json",
            "Authorization": auth_header,
            "IdToken": id_token,
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
            raise Exception(f"GraphQL query failed with errors: {body['errors']}.")

        return body

    def get_resource_from_id(self, resource_id):
        resp = self.run_graphql_query(resource_from_id_query, variables={"resourceId": resource_id})
        resource = resp["data"]["resource"]
        if not resource:
            raise OperationOutcome(f"Resource with id {resource_id} does not exist")
        return resource
