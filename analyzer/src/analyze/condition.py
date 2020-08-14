from typing import Dict, List, NewType, Tuple, Union

from .sql_column import SqlColumn

CONDITION_FLAG = "__condition__"


DataDictKey = NewType("DataDictKey", Tuple[str, Tuple[str, str]])
DataDictValue = NewType("DataDictValue", Union[str, List[str]])

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
        # TODO better type handling?
        self.value = float(value) if value.isnumeric() else value

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

        is_relation_true = CONDITION_RELATION_TO_FUNCTION[self.relation](data_value, self.value)

        return (self.action == "EXCLUDE") ^ is_relation_true
