from typing import Dict, List, NewType, Tuple, Union

from .sql_column import SqlColumn

CONDITION_FLAG = "__condition__"


DataDictKey = NewType("DataDictKey", Tuple[str, Tuple[str, str]])
DataDictValue = NewType("DataDictValue", Union[str, List[str]])


class Condition:
    def __init__(
        self, action: str = None, sql_column: SqlColumn = None, value: str = None,
    ):
        self.action = action
        self.sql_column = sql_column
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

        # TODO handle types
        return (self.action == "EXCLUDE") ^ (self.value == str(data_value))
