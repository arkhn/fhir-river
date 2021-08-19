from rest_framework.exceptions import NotAuthenticated, PermissionDenied

from django.conf import settings

import requests
from river.common.errors import OperationOutcome


# FIXME: use this function on a mapping before sending it to the analyzer
def dereference_concept_map(mapping, auth_token: str):
    for attribute in mapping["attributes"]:
        for input_group in attribute["inputGroups"]:
            for input_ in input_group["inputs"]:
                if concept_map_id := input_.get("conceptMapId"):
                    concept_map = fetch_concept_map(concept_map_id, auth_token)
                    input_["conceptMap"] = concept_map


def fetch_concept_map(concept_map_id: str, auth_token: str):
    try:
        response = requests.get(
            f"{settings.FHIR_API_URL}/ConceptMap/{concept_map_id}",
            headers={"Authorization": f"Bearer {auth_token}", "Cache-Control": "no-cache"},
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
    for group in body["group"]:
        for element in group["element"]:
            # NOTE we only handle a single target for each source
            concept_map[element["code"]] = element["target"][0]["code"]

    return concept_map
