import logging
from typing import List

from river.adapters.scripts_repository import Script

logger = logging.getLogger(__name__)


class MergingScript:
    def __init__(self, script: Script):
        self.script = script

    def __eq__(self, operand) -> bool:
        return self.script.name == operand.name

    def apply(self, data_columns, static_inputs: List[str], attr_path, primary_key):
        try:
            args = data_columns + static_inputs
            return self.script.func(*args)
        except Exception as e:
            logger.exception(
                f"{self.script.name}: Error merging columns for attribute at path "
                f"{attr_path} (at id={primary_key}): {e}"
            )
            return data_columns
