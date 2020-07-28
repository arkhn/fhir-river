from .cleaning_script import CleaningScript
from .concept_map import ConceptMap


class SqlColumn:
    def __init__(
        self,
        table: str,
        column: str,
        owner: str = None,
        cleaning_script: CleaningScript = None,
        concept_map: ConceptMap = None,
    ):
        self.table = table.strip()
        self.column = column.strip()
        self.owner = owner.strip() if owner else None

        self.cleaning_script = cleaning_script
        self.concept_map = concept_map

        self.truncated_name = None

    def __eq__(self, other) -> bool:
        return (
            self.table == other.table and self.column == other.column and self.owner == other.owner
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

    def dataframe_column_name(self, index=None):
        """ sqlalchemy builds column names as {table}_{column}.
        This method helps retrieving the needed columns from the dataframe.
        """
        name = f"{self.table}_{self.column}"
        if len(name) <= 30:
            return name

        # Otherwise, we may have problems with sql not accepting aliases of length > 30
        # so we truncate and replace the end by the hex encoded index

        if self.truncated_name is not None:
            return self.truncated_name

        if index is None:
            raise ValueError(
                "Aliases can't be longer than 30 character, please provide an index argument."
            )

        truncated = name[:-5]
        hex_index = format(index, "5x")
        self.truncated_name = f"{truncated}{hex_index}"
        return self.truncated_name
