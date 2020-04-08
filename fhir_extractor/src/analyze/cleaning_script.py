import numpy as np
import logging

import scripts


class CleaningScript:
    def __init__(self, name: str):
        self.name = name
        self.script = scripts.get_script(name)

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, df_column, pk_column):
        def clean_and_log(val, id=None, col=None):
            try:
                return self.script(val)
            except Exception as e:
                logging.error(f"{self.name}: Error cleaning {col} (at id = {id}): {e}")

        return np.vectorize(clean_and_log)(df_column, id=pk_column, col=df_column.name[0])
