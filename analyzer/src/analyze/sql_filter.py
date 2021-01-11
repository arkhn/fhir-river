from .sql_column import SqlColumn


class SqlFilter:
    def __init__(self, sql_column: SqlColumn, relation: str, value: str):
        self.sql_column = sql_column
        self.relation = relation
        self.value = value

    def __eq__(self, other) -> bool:
        return (
            self.sql_column == other.sql_column
            and self.relation == other.relation
            and self.value == other.value
        )
