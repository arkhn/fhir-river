from collections import OrderedDict
from dataclasses import dataclass
from inspect import getdoc, getmembers, isfunction
from typing import Callable

from common.scripts import cleaning, merging


@dataclass(frozen=True)
class Script:
    func: Callable
    name: str
    description: str
    category: str


class ScriptsRepository:
    """This class is used when we need to get a cleaning/merging script.

    It uses the "inspect" python package to determine which scripts are available.
    """

    def __init__(self):
        self.scripts = OrderedDict()

        for script_name, script in getmembers(cleaning, isfunction):
            self.scripts[script_name] = Script(
                func=script, name=script_name, description=getdoc(script), category="cleaning"
            )

        for script_name, script in getmembers(merging, isfunction):
            self.scripts[script_name] = Script(
                func=script, name=script_name, description=getdoc(script), category="merging"
            )

    def get(self, name: str) -> Script:
        """Gets the script at a specified key."""
        try:
            return self.scripts[name]
        except KeyError:
            raise NameError(f"Script {name} not found.")
