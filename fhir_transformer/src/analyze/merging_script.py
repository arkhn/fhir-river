from typing import List
import logging

import scripts


class MergingScript:
    def __init__(self, name: str):
        self.name = name
        self.script = scripts.get_script(name)

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, data_columns, static_inputs: List[str], attr_path, primary_key):
        try: 
            args = data_columns + static_inputs
            return self.script(*args)
        except Exception as e:
            logging.error(
                f"{self.name}: Error merging columns for attribute at path "
                f"{attr_path} (at id={primary_key}): {e}"
            )
