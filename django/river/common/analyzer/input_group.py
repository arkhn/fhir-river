from typing import List

from common.scripts import MergingScript

from .condition import Condition
from .sql_column import SqlColumn


class InputGroup:
    def __init__(
        self,
        id_,
        attribute,
        conditions: List[Condition] = None,
        columns: List[SqlColumn] = None,
        static_inputs: List[str] = None,
        merging_script: MergingScript = None,
    ):
        self.id = id_
        self.attribute = attribute

        self.conditions = conditions or []
        self.columns = columns or []
        self.static_inputs = static_inputs or []
        self.merging_script = merging_script

    def add_condition(self, condition):
        self.conditions.append(condition)

    def add_column(self, col):
        self.columns.append(col)

    def add_static_input(self, value):
        self.static_inputs.append(self.attribute.cast_type(value))

    def __str__(self):
        return f"columns: {self.columns}, static_inputs: {self.static_inputs}, merging_script: {self.merging_script}"

    def __eq__(self, other):
        if not isinstance(other, InputGroup):
            return False

        return (
            self.columns == other.columns
            and self.static_inputs == other.static_inputs
            and self.merging_script == other.merging_script
            and self.conditions == other.conditions
        )
