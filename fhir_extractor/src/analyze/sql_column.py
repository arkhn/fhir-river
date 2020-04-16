class SqlColumn:
    def __init__(
        self, table: str, column: str, owner: str = None,
    ):
        self.table = table.strip()
        self.column = column.strip()
        self.owner = owner.strip() if owner else None

    def __eq__(self, other) -> bool:
        return (
            self.table == other.table
            and self.column == other.column
            and self.owner == other.owner
        )

    def __str__(self) -> str:
        if self.owner:
            return f"{self.owner}.{self.table}.{self.column}"
        else:
            return f"{self.table}.{self.column}"

    def __hash__(self):
        return hash(str(self))

    def table_name(self) -> str:
        if self.owner:
            return f"{self.owner}.{self.table}"
        else:
            return f"{self.table}"

    def dataframe_column_name(self):
        """ sqlalchemy builds column names as {table}_{column}.
        This method helps retrieving the needed columns from the dataframe.
        """
        return f"{self.table}_{self.column}"
