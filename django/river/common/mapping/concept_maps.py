from typing import Optional

from common.adapters.fhir_api import fhir_api


# FIXME: use this function on a mapping before sending it to the analyzer
def dereference_concept_map(mapping, auth_token: Optional[str]):
    for attribute in mapping["attributes"]:
        for input_group in attribute["input_groups"]:
            for sql_input in input_group["sql_inputs"]:
                if concept_map_id := sql_input.get("concept_map_id"):
                    concept_map = format_concept_map(concept_map_id, auth_token)
                    sql_input["concept_map"] = concept_map


def format_concept_map(concept_map_id: str, auth_token: Optional[str]):
    concept_map_resource = fhir_api.retrieve("ConceptMap", concept_map_id, auth_token)
    concept_map = {}
    for group in concept_map_resource["group"]:
        for element in group["element"]:
            # NOTE we only handle a single target for each project
            concept_map[element["code"]] = element["target"][0]["code"]
    return concept_map
