from typing import TypeVar, Mapping
import os
import requests

from analyzer.src.errors import OperationOutcome
from logger import get_logger

logger = get_logger(["resource_id"])

FHIR_API_URL = os.getenv("FHIR_API_URL")
FHIR_API_TOKEN = os.getenv("FHIR_API_TOKEN")

T = TypeVar("T", bound="ConceptMap")


class ConceptMap:
    def __init__(
        self, concept_map_id: str,
    ):
        """
        Converts a FHIR concept map to an object which is easier to use.
        """
        fhir_concept_map: Mapping = ConceptMap.fetch(concept_map_id)

        self.mapping = ConceptMap.convert_to_dict(fhir_concept_map)
        self.id = fhir_concept_map["id"]
        self.title = fhir_concept_map["title"]

    def __eq__(self, operand) -> bool:
        return self.title == operand.title and self.mapping == operand.mapping

    @staticmethod
    def fetch(concept_map_id: str) -> T:
        try:
            response = requests.get(
                f"{FHIR_API_URL}/ConceptMap/{concept_map_id}",
                headers={"Authorization": f"Bearer {FHIR_API_TOKEN}"},
            )
        except requests.exceptions.ConnectionError as e:
            raise OperationOutcome(f"Could not connect to the fhir-api service: {e}")

        if response.status_code != 200:
            raise Exception(f"Error while fetching concept map {concept_map_id}: {response.text}.")
        return response.json()

    @staticmethod
    def convert_to_dict(fhir_concept_map):
        mapping = {}
        for group in fhir_concept_map["group"]:
            for element in group["element"]:
                # NOTE fhirpipe can only handle a single target for each source
                source_code = element["code"]
                target_code = element["target"][0]["code"]
                mapping[source_code] = target_code
        return mapping

    def translate(self, source_code: str) -> str:
        return self.mapping[source_code]

    def apply(self, data_column, col_name, primary_key):
        try:
            return [self.translate(val) for val in data_column]
        except Exception as e:
            logger.error(f"{self.title}: Error mapping {col_name} (at id = {primary_key}): {e}")
            return data_column
