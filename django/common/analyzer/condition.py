from datetime import datetime
from typing import Dict, List, NewType, Tuple, Union

from common.analyzer.sql_column import SqlColumn
from common.errors import OperationOutcome

CONDITION_FLAG = "__condition__"

# NOTE If the reference value is null, we want the relation to be False,
# that's why we check for `x is not None` in all the binary relations.
# For instance, if we want to INCLUDE the attribute if a column EQ a value and
# this value is null, we won't keep it. On the other hand,
# if we want to EXCLUDE the attribute if a column EQ a value and
# this value is null, we will keep it.
CONDITION_RELATION_TO_FUNCTION = {
    "EQ": lambda x, y: x is not None and x == y,
    "NEQ": lambda x, y: x is not None and x != y,
    "LT": lambda x, y: x is not None and x < y,
    "LE": lambda x, y: x is not None and x <= y,
    "GE": lambda x, y: x is not None and x >= y,
    "GT": lambda x, y: x is not None and x > y,
    "IN": lambda x, y: x is not None and x in y,
    "NULL": lambda x, _: x is None,
    "NOTNULL": lambda x, _: x is not None,
}

UNARY_RELATIONS = ["NULL", "NOTNULL"]

DataDictKey = NewType("DataDictKey", Tuple[str, Tuple[str, str]])
DataDictValue = NewType("DataDictValue", Union[str, List[str]])


class Condition:
    def __init__(self, action: str = None, sql_column: SqlColumn = None, relation: str = None, value: str = None):
        self.action = action
        self.sql_column = sql_column
        self.relation = relation
        self.value = value.split(",") if relation == "IN" else value

    def check(self, data: Dict[DataDictKey, DataDictValue]):
        value_data = data[(CONDITION_FLAG, self.sql_column.col_name_with_joins())]

        try:
            cast_value = self.cast_value_type(value_data)
        except Exception as e:
            raise OperationOutcome(f"Could not cast condition value ({self.value}) to type {type(value_data)}: {e}")

        # We first check if the relation between the condition's value and
        # the value fetched from the DB holds.
        is_relation_true = CONDITION_RELATION_TO_FUNCTION[self.relation](value_data, cast_value)

        # Then, to know if we need to include the input group or not, we need to XOR
        # is_relation_true with self.action == "EXCLUDE".
        # For instance, if the relation holds but the action is "EXCLUDE", we want
        # to return False (and to exclude the input group from the attribute).
        return (self.action == "EXCLUDE") ^ is_relation_true

    def cast_value_type(self, value_data, condition_data=None):
        if self.relation in UNARY_RELATIONS or value_data is None:
            # For unary relations, we don't need a reference value
            return None

        if self.relation == "IN" and condition_data is None:
            return [self.cast_value_type(value_data, val) for val in self.value]

        condition_data = condition_data or self.value
        if isinstance(value_data, bool):
            # For booleans, we cast to False if the value is "0", "false" or "False"
            cast_value = condition_data.lower() not in ["0", "false"]
        elif isinstance(value_data, str) and self.is_date(value_data):
            # For dates, we parse the string
            # NOTE the input date format is fixed here
            cast_value = datetime.strptime(condition_data, "%Y-%m-%d").strftime("%Y-%m-%dT%H:%M:%S")
        else:
            cast_value = type(value_data)(condition_data)

        return cast_value

    @staticmethod
    def is_date(raw_input):
        try:
            # flask jsonifies dates to this format
            datetime.strptime(raw_input, "%Y-%m-%dT%H:%M:%S")
            return True
        except ValueError:
            return False

    def __eq__(self, other):
        if not isinstance(other, Condition):
            return False
        return (
            self.action == other.action
            and self.sql_column == other.sql_column
            and self.relation == other.relation
            and self.value == other.value
        )
