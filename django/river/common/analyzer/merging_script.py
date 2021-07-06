import logging
from typing import List

from common.scripts import get_script

logger = logging.getLogger(__name__)


class MergingScript:
    def __init__(self, name: str):
        self.name = name
        self.script = get_script(name)

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, data_columns, static_inputs: List[str], attr_path, primary_key):
        try:
            args = data_columns + static_inputs
            return self.script(*args)
        except Exception as e:
            logger.exception(
                f"{self.name}: Error merging columns for attribute at path {attr_path} (at id={primary_key}): {e}"
            )
            return data_columns
