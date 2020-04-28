import scripts

from transformer.src.config.logger import create_logger

logger = create_logger("cleaning_scripts")


class CleaningScript:
    def __init__(self, name: str):
        self.name = name
        try:
            self.script = scripts.get_script(name)
        except Exception:
            # TODO better handling here
            logger.error(f"Error while fetching script {name}.")
            self.script = None

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, data_column, col_name, primary_key):
        try:
            return [self.script(val) for val in data_column]
        except Exception as e:
            logger.error(f"{self.name}: Error cleaning {col_name} (at id = {primary_key}): {e}")
            return data_column
