import hashlib

from .cleaning_script import CleaningScript
from .concept_map import ConceptMap


class SqlColumn:
    def __init__(
        self,
        owner: str,
        table: str,
        column: str,
        cleaning_script: CleaningScript = None,
        concept_map: ConceptMap = None,
        joins=None,
    ):
        self.table = table.strip()
        self.column = column.strip()
        self.owner = owner.strip()

        if not self.table or not self.column:
            raise ValueError("Cannot create an SqlColumn with empty table or column.")

        self.cleaning_script = cleaning_script
        self.concept_map = concept_map
        self.joins = joins or []

    def add_join(self, join):
        self.joins.append(join)

    def __eq__(self, other) -> bool:
        return (
            self.table == other.table
            and self.column == other.column
            and self.owner == other.owner
            and self.joins == other.joins
        )

    def __str__(self) -> str:
        return f"{self.owner}.{self.table}.{self.column}"

    def table_name(self) -> str:
        return f"{self.owner}.{self.table}"

    def col_name_with_joins(self) -> str:
        if self.joins:
            return f"{self.owner}_{self.table}_{self.column}_{'_'.join(str(join) for join in self.joins)}"
        else:
            return f"{self.owner}_{self.table}_{self.column}"

    def __hash__(self):
        return hash(self.col_name_with_joins())

    def dataframe_column_name(self):
        """sqlalchemy builds column names as {table}_{column}.
        This method helps retrieving the needed columns from the dataframe.

        We add a hash to the name built based on the column name and the joins used
        because:
        - we want to avoid collision if we need to truncate the name.
        - we may need to differentiate the same column used with different joins.
        """
        name = f"{self.table}_{self.column}"
        hash_ = hashlib.sha1(self.col_name_with_joins().encode()).hexdigest()  # nosec

        # We may have problems with sql not accepting aliases of length > 30
        if len(name) < 22:
            return f"{name}_{hash_[:8]}"
        else:
            return f"{name[:10]}_{name[-10:]}_{hash_[:8]}"
