from .sql_column import SqlColumn


class Condition:
    def __init__(
        self, action: str = None, sql_column: SqlColumn = None, value: str = None,
    ):
        self.action = action
        self.sql_column = sql_column
        self.value = value
