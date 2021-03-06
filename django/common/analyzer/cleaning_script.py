import logging

import scripts

logger = logging.getLogger(__name__)


class CleaningScript:
    def __init__(self, name: str):
        self.name = name
        try:
            self.script = scripts.get_script(name)
        except Exception:
            # TODO better handling here
            logger.exception(f"Error while fetching script {name}.")
            self.script = None

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, data_column, col_name, primary_key):
        try:
            return [self.script(val) for val in data_column]
        except Exception as e:
            logger.exception(f"{self.name}: Error cleaning {col_name} (at id = {primary_key}): {e}")
            return data_column
