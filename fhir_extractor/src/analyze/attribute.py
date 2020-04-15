from typing import List
from .sql_column import SqlColumn


class Attribute:
    def __init__(
        self, path, columns: List[SqlColumn] = [],
    ):
        self.path = path
        self.columns = columns

    def __eq__(self, other):
        if not isinstance(other, Attribute):
            return False
        return (
            self.path == other.path
            and self.columns == other.columns
        )

    def __str__(self):
        return f"path: {self.path}, columns: {self.columns}"

    def __hash__(self):
        return hash("{self.path}{self.columns}")

    def add_column(self, col):
        self.columns.append(col)
