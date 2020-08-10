from .sql_column import SqlColumn

CONDITION_FLAG = "__condition__"


class Condition:
    def __init__(
        self, action: str = None, sql_column: SqlColumn = None, value: str = None,
    ):
        self.action = action
        self.sql_column = sql_column
        self.value = value

    def check(self, data):
        data_value = data[(CONDITION_FLAG, (self.sql_column.table, self.sql_column.column))]
        return self.action == "EXLUDE" ^ self.value == data_value
