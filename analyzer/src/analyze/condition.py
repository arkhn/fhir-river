from typing import Dict, List, NewType, Tuple, Union

from datetime import datetime

from analyzer.src.config.logger import get_logger
from analyzer.src.errors import OperationOutcome

from .sql_column import SqlColumn


CONDITION_FLAG = "__condition__"

CONDITION_RELATION_TO_FUNCTION = {
    "EQ": lambda x, y: x == y,
    "NEQ": lambda x, y: x != y,
    "LT": lambda x, y: x < y,
    "LE": lambda x, y: x <= y,
    "GE": lambda x, y: x >= y,
    "GT": lambda x, y: x > y,
    "NULL": lambda x, _: x is None,
    "NOTNULL": lambda x, _: x is not None,
}

UNARY_RELATIONS = ["NULL", "NOTNULL"]

DataDictKey = NewType("DataDictKey", Tuple[str, Tuple[str, str]])
DataDictValue = NewType("DataDictValue", Union[str, List[str]])

logger = get_logger()


class Condition:
    def __init__(
        self,
        action: str = None,
        sql_column: SqlColumn = None,
        relation: str = None,
        value: str = None,
    ):
        self.action = action
        self.sql_column = sql_column
        self.relation = relation
        # We turn the value into a number if it looks like one
        self.value = value

    def check(self, data: Dict[DataDictKey, DataDictValue]):
        data_value = data[(CONDITION_FLAG, (self.sql_column.table, self.sql_column.column))]

        # if data_value is an array, all of its values should be similar
        if isinstance(data_value, tuple):
            if not all(el == data_value[0] for el in data_value[1:]):
                raise ValueError(
                    "Conditions can only be checked against arrays with identical values, "
                    f"got {data_value}."
                )
            data_value = data_value[0]

        try:
            cast_value = self.cast_value_type(data_value)
        except Exception as e:
            raise OperationOutcome(
                f"Could not cast condition value ({self.value}) to type {type(data_value)}: {e}"
            )

        # We first check if the relation between the condition's value and
        # the value fetched from the DB holds.
        is_relation_true = CONDITION_RELATION_TO_FUNCTION[self.relation](data_value, cast_value)

        # Then, to know if we need to include the input group or not, we need to XOR
        # is_relation_true with self.action == "EXCLUDE".
        # For instance, if the relation holds but the action is "EXCLUDE", we want to return
        # False (and to exclude the input group from the attribute).
        return (self.action == "EXCLUDE") ^ is_relation_true

    def cast_value_type(self, data_value):
        if self.relation in UNARY_RELATIONS:
            # For unary relations, we don't need a reference value
            cast_value = None
        elif isinstance(data_value, bool):
            # For booleans, we cast to False if the value is "0", "false" or "False"
            cast_value = self.value.lower() not in ["0", "false"]
        elif isinstance(data_value, str) and self.is_date(data_value):
            # For dates, we parse the string
            # NOTE the input date format is fixed here
            cast_value = datetime.strptime(self.value, "%Y-%m-%d").strftime("%Y-%m-%dT%H:%M:%S")
        else:
            cast_value = type(data_value)(self.value)

        return cast_value

    @staticmethod
    def is_date(raw_input):
        try:
            # flask jsonifies dates to this format
            datetime.strptime(raw_input, "%Y-%m-%dT%H:%M:%S")
            return True
        except ValueError:
            return False
