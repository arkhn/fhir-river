import logging

logger = logging.getLogger(__name__)


class ConceptMap:
    def __init__(self, mapping: dict, id_: str):
        self.mapping = mapping
        self.id = id_

    def __eq__(self, operand) -> bool:
        return self.mapping == operand.mapping

    def translate(self, source_code: str) -> str:
        return self.mapping[source_code]

    def apply(self, data_column, col_name, primary_key):
        try:
            return [self.translate(val) for val in data_column]
        except Exception as e:
            logger.exception(f"Error mapping {col_name} with concept map {self.id} (at id = {primary_key}): {e}")
            return data_column
