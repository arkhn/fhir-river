import logging

import scripts

logger = logging.getLogger(__name__)


class MergingScript:
    def __init__(self, name: str):
        self.name = name
        self.script = scripts.get_script(name)

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, args, attr_path, primary_key):
        try:
            return self.script(*args)
        except Exception as e:
            logger.exception(
                f"{self.name}: Error merging columns for attribute at path {attr_path} (at id={primary_key}): {e}"
            )
            return args
