from typing import List
from .sql_column import SqlColumn
from .merging_script import MergingScript


class Attribute:
    def __init__(
        self,
        path,
        columns: List[SqlColumn] = [],
        static_inputs: List[str] = [],
        merging_script: MergingScript = None,
    ):
        self.path = path
        self.columns = columns
        self.static_inputs = static_inputs
        self.merging_script = merging_script

    def __eq__(self, other):
        if not isinstance(other, Attribute):
            return False
        return (
            self.path == other.path
            and self.columns == other.columns
            and self.static_inputs == other.static_inputs
            and self.merging_script == other.merging_script
        )

    def __str__(self):
        return (
            f"path: {self.path}, columns: {self.columns}, "
            f"static_inputs: {self.static_inputs}, merging_script: {self.merging_script}"
        )

    def __hash__(self):
        return hash("{self.path}{self.columns}{self.static_inputs}{self.merging_script}")

    def add_column(self, col):
        self.columns.append(col)

    def add_static_input(self, value):
        self.static_inputs.append(value)
