import logging
from collections import OrderedDict
from dataclasses import dataclass
from inspect import getdoc, getmembers, isfunction
from typing import Callable, List

from common.scripts import cleaning, merging

logger = logging.getLogger(__name__)


class ScriptNotFound(Exception):
    pass


@dataclass(frozen=True)
class Script:
    func: Callable
    name: str
    description: str
    category: str

    def __eq__(self, operand) -> bool:
        return self.name == operand.name

    def apply(self, data_columns, static_inputs: List[str], attr_path, primary_key):
        raise NotImplementedError


class MergingScript(Script):
    def apply(self, data_columns, static_inputs: List[str], attr_path, primary_key):
        try:
            args = data_columns + static_inputs
            return self.func(*args)
        except Exception as e:
            logger.exception(
                f"{self.name}: Error merging columns for attribute at path " f"{attr_path} (at id={primary_key}): {e}"
            )
            return data_columns


class CleaningScript(Script):
    def apply(self, data_column, col_name, primary_key):
        try:
            return [self.func(val) for val in data_column]
        except Exception as e:
            logger.exception(f"{self.script.name}: Error cleaning {col_name} (at id = {primary_key}): {e}")
            return data_column


class ScriptsRepository:
    """This class is used when we need to get a cleaning/merging script.

    It uses the "inspect" python package to determine which scripts are available.
    """

    def __init__(self):
        self.scripts = OrderedDict()

        for script_name, script in getmembers(cleaning, isfunction):
            self.scripts[script_name] = CleaningScript(
                func=script, name=script_name, description=getdoc(script), category="cleaning"
            )

        for script_name, script in getmembers(merging, isfunction):
            self.scripts[script_name] = MergingScript(
                func=script, name=script_name, description=getdoc(script), category="merging"
            )

    def get(self, name: str) -> Script:
        """Gets the script at a specified key."""
        try:
            return self.scripts[name]
        except KeyError:
            raise ScriptNotFound(f"Script {name} not found.")
