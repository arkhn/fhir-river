from .sql_column import SqlColumn


class SqlJoin:
    def __init__(self, left: "SqlColumn", right: "SqlColumn"):
        self.left = left
        self.right = right

    def __eq__(self, other) -> bool:
        return self.left == other.left and self.right == other.right

    def __str__(self) -> str:
        return f"({self.left}, {self.right})"

    def __hash__(self):
        return hash(str(self))
