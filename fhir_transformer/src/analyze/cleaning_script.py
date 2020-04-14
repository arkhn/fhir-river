import inspect
import numpy as np

import scripts

from fhir_transformer.src.config.logger import create_logger

logger = create_logger("cleaning_scripts")

class CleaningScript:
    def __init__(self, name: str):
        self.name = name
        try:
            self.script = scripts.get_script(name)
        except:
            # TODO better handling here
            logger.error(f"Error while fetching script {name}.")
            self.script = None

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, df_column, pk_column):
        def clean_and_log(val, id=None, col=None):
            try:
                return self.script(val)
            except Exception as e:
                logger.error(f"{self.name}: Error cleaning {col} (at id = {id}): {e}")

        return np.vectorize(clean_and_log)(df_column, id=pk_column, col=df_column.name[0])
