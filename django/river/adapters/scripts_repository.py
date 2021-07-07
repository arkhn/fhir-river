from dataclasses import dataclass
from inspect import getdoc, getmembers, isfunction
from typing import Callable

from common import scripts


@dataclass(frozen=True)
class Script:
    func: Callable
    name: str
    description: str


class ScriptsRepository:
    """This class is used when we need to get a cleaning/merging script.

    An ScriptsRepository is an abstraction for scripts retrieval.
    It should have a `get` method.
    """

    def get(self, name: str) -> Script:
        """Gets the script with a specified name."""
        raise NotImplementedError


class MemoryScriptsRepository(ScriptsRepository):
    """This class is the default implementation of a ScriptsRepository.

    It uses the "inspect" python package to determine which scripts are available.
    """

    def __init__(self):
        self.scripts = {}
        for script_name, script in getmembers(scripts, isfunction):
            doc = getdoc(script)
            self.scripts[script_name] = Script(func=script, name=script_name, description=doc)

    def get(self, name: str) -> Script:
        """Gets the script at a specified key."""
        try:
            return self.scripts[name]
        except KeyError:
            raise NameError("Script", name, "not found.")
