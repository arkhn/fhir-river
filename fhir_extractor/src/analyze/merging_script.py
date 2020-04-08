from typing import List

import numpy as np
import logging

import scripts


class MergingScript:
    def __init__(self, name: str):
        self.name = name
        self.script = scripts.get_script(name)

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, df_columns, static_inputs: List[str], pk_column):

        def merge_and_log(*val, id=None, cols=None):
            try:
                return self.script(*val)
            except Exception as e:
                logging.error(
                    f"{self.name}: Error merging columns "
                    f"{''.join([col.name for col in df_columns])} (at id={id}): {e}"
                )

        args = df_columns + static_inputs
        return np.vectorize(merge_and_log)(*args, id=pk_column)
