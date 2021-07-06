import logging

from common.scripts import get_script

logger = logging.getLogger(__name__)


class CleaningScript:
    def __init__(self, name: str):
        self.name = name
        try:
            self.script = get_script(name)
            print(self.script)
        except NameError as err:
            # TODO better handling here
            logger.exception(f"Error while fetching script {err}.")
            self.script = None

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, data_column, col_name, primary_key):
        try:
            return [self.script(val) for val in data_column]
        except Exception as e:
            logger.exception(f"{self.name}: Error cleaning {col_name} (at id = {primary_key}): {e}")
            return data_column
