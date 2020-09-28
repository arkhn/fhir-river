from analyzer.src.config.service_logger import logger


class ConceptMap:
    def __init__(
        self, fhir_concept_map: dict,
    ):
        """
        Converts a FHIR concept map to an object which is easier to use.
        """
        self.mapping = ConceptMap.convert_to_dict(fhir_concept_map)
        self.id = fhir_concept_map["id"]
        self.title = fhir_concept_map["title"]

    def __eq__(self, operand) -> bool:
        return self.title == operand.title and self.mapping == operand.mapping

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
