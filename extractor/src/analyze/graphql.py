import os
import requests

from extractor.src.errors import PyrogQueryError


PYROG_TOKEN = os.getenv("PYROG_TOKEN")
PYROG_API_URL = os.getenv("PYROG_API_URL")

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
}

fragment a on Attribute {
    path
    definitionId
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
        filters {
            ...entireFilter
        }
        definitionId
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


def get_headers():
    return {
        "content-type": "application/json",
        "Authorization": f"Bearer {PYROG_TOKEN}",
    }


def run_graphql_query(graphql_query, variables=None):
    """
    This function queries a GraphQL endpoint
    and returns a json parsed response.
    """
    response = requests.post(
        PYROG_API_URL, headers=get_headers(), json={"query": graphql_query, "variables": variables},
    )
    if response.status_code != 200:
        raise PyrogQueryError(
            f"Query failed with returning code {response.status_code}\n{response.reason}."
        )

    json_response = response.json()
    if "errors" in json_response:
        raise PyrogQueryError(f"GraphQL query failed with errors: {json_response['errors']}.")

    return json_response


def get_resource_from_id(resource_id):
    resp = run_graphql_query(resource_from_id_query, variables={"resourceId": resource_id})
    resource = resp["data"]["resource"]
    if not resource:
        raise PyrogQueryError(f"Resource with id {resource_id} does not exist")
    return resource
