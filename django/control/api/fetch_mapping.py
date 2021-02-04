from rest_framework.exceptions import NotAuthenticated, PermissionDenied

from django.conf import settings

import requests
from common.errors import OperationOutcome

resource_from_id_query = """
fragment entireColumn on Column {
    owner {
        name
    }
    table
    column
    joins {
        tables {
            owner {
                name
            }
            table
            column
        }
    }
}

fragment entireFilter on Filter {
    id
    sqlColumn {
        ...entireColumn
    }
    relation
    value
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
        ...entireColumn
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
}

fragment cred on Credential {
    model
    host
    port
    database
    login
    password: decryptedPassword
}

query resource($resourceId: String!) {
    resource(where: {id: $resourceId}) {
        id
        primaryKeyOwner {
            name
        }
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
}"""


def fetch_resource_mapping(resource_id: str, authorization_header: str):
    # TODO exceptions
    try:
        response = requests.post(
            settings.PYROG_API_URL,
            headers={"Authorization": authorization_header},
            json={"query": resource_from_id_query, "variables": {"resourceId": resource_id}},
        )
    except requests.exceptions.ConnectionError:
        raise OperationOutcome("Could not connect to the Pyrog service")

    if response.status_code != 200:
        raise OperationOutcome(f"graphql query failed with returning code {response.status_code}\n{response.json()}")

    body = response.json()
    if "errors" in body:
        if body["errors"][0]["statusCode"] == 401:
            raise NotAuthenticated("error while fetching mapping: Token is invalid")
        elif body["errors"][0]["statusCode"] == 403:
            raise PermissionDenied("error while fetching mapping: You don't have rights to perform this action")
        else:
            raise OperationOutcome(f"error while fetching mapping: {body['errors']}")

    resource = body["data"]["resource"]

    dereference_concept_map(resource, authorization_header)

    if not resource:
        raise OperationOutcome(f"resource with id {resource_id} does not exist")
    return resource


def dereference_concept_map(mapping, authorization_header: str):
    for attribute in mapping["attributes"]:
        for input_group in attribute["inputGroups"]:
            for input_ in input_group["inputs"]:
                if concept_map_id := input_.get("conceptMapId"):
                    concept_map = fetch_concept_map(concept_map_id, authorization_header)
                    input_["conceptMap"] = concept_map


def fetch_concept_map(concept_map_id: str, authorization_header: str):
    try:
        response = requests.get(
            f"{settings.FHIR_API_URL}/{concept_map_id}", headers={"Authorization": authorization_header}
        )
    except requests.exceptions.ConnectionError:
        raise OperationOutcome("could not connect to fhir-api")

    if response.status_code == 401:
        raise NotAuthenticated("error while fetching concept map: Token is invalid")
    elif response.status_code == 403:
        raise PermissionDenied("error while fetching concept map: You don't have rights to perform this action")
    elif response.status_code != 200:
        raise OperationOutcome(f"error while fetching concept map: {response.json()}")

    body = response.json()

    concept_map = {}
    resource = body["data"]
    for group in resource["group"]:
        for element in group["element"]:
            # NOTE we only handle a single target for each source
            concept_map[element["code"]] = element["target"][0]["code"]

    return concept_map
