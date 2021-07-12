import logging

from common.scripts import Script

logger = logging.getLogger(__name__)


class CleaningScript:
    def __init__(self, script: Script):
        self.script = script

    def __eq__(self, operand) -> bool:
        return self.script.name == operand.name

    def apply(self, data_column, col_name, primary_key):
        try:
            return [self.script.func(val) for val in data_column]
        except Exception as e:
            logger.exception(f"{self.script.name}: Error cleaning {col_name} (at id = {primary_key}): {e}")
            return data_column
