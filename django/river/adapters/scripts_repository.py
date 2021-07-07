from dataclasses import dataclass
from inspect import getdoc, getmembers, isfunction, ismodule
from typing import Callable

from common import scripts


@dataclass(frozen=True)
class Script:
    func: Callable
    name: str
    description: str
    category: str


class ScriptsRepository:
    """This class is used when we need to get a cleaning/merging script.

    An ScriptsRepository is basically an abstraction over a read-only key-value store.
    It should have a method `get`.
    """

    def get(self, name: str) -> Script:
        """Gets the script with a specified name."""
        raise NotImplementedError


class MemoryScriptsRepository(ScriptsRepository):
    def __init__(self):
        self.scripts = {}
        for module_name, module in getmembers(scripts, ismodule):
            for script_name, script in getmembers(module, isfunction):
                doc = getdoc(script)
                self.scripts[script_name] = Script(
                    func=script, name=script_name, description=doc, category=module_name
                )

    def get(self, name: str) -> Script:
        """Gets the script at a specified key."""
        try:
            return self.scripts[name]
        except KeyError:
            raise NameError("Script", name, "not found.")
