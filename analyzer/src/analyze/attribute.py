from typing import List

from analyzer.src.config.logger import create_logger

from .sql_column import SqlColumn
from .merging_script import MergingScript

logger = create_logger("attribute")

numerical_types_map = {
    "integer": int,
    "decimal": float,
    "unsignedInt": int,
    "positiveInt": int,
}


class Attribute:
    def __init__(
        self,
        path,
        definition_id: str = None,
        columns: List[SqlColumn] = None,
        static_inputs: List[str] = None,
        merging_script: MergingScript = None,
    ):
        self.path = path
        self.type = numerical_types_map.get(definition_id, str)
        self.columns = columns or []
        self.static_inputs = static_inputs or []
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
        self.static_inputs.append(self.cast_type(value))

    def cast_type(self, value):
        if value is None:
            return None

        try:
            return self.type(value)
        except:
            logger.error(
                f"Could not cast value {value} to type {self.type} "
                f"on attribute at path = {self.path}): {e}"
            )
