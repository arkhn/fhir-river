from django.conf import settings

import requests

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
        raise Exception("Could not connect to the Pyrog service")

    if response.status_code != 200:
        raise Exception(f"graphql query failed with returning code {response.status_code}\n{response.json()}")
    body = response.json()
    if "errors" in body:
        raise Exception(f"graphql query failed with errors: {body['errors']}")

    resource = body["data"]["resource"]

    dereference_concept_map(resource, authorization_header)

    if not resource:
        raise Exception(f"resource with id {resource_id} does not exist")
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
        raise Exception("could not connect to fhir-api")

    if response.status_code != 200:
        raise Exception(f"error while fetching concept map\n{response.json()}")

    body = response.json()

    concept_map = {}
    resource = body["data"]
    for group in resource["group"]:
        for element in group["element"]:
            # NOTE we only handle a single target for each source
            concept_map[element["code"]] = element["target"][0]["code"]

    return concept_map
