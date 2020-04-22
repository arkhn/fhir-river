from typing import Dict, List, Set

from transformer.src.analyze.sql_column import SqlColumn
from transformer.src.analyze.sql_join import SqlJoin
from transformer.src.analyze.attribute import Attribute


class Analysis:
    def __init__(self):
        self.source_id: str = None
        self.resource_id: str = None
        self.definition: Dict = None
        self.attributes: List[Attribute] = []
        self.columns: Set[SqlColumn] = set()
        self.joins: Set[SqlJoin] = set()
        self.primary_key_column: SqlColumn = None
        self.squash_rules = None
        self.reference_paths: Set[str] = set()
        self.is_static = False

    def reset(self):
        self.source_id = None
        self.resource_id = None
        self.definition = None
        self.attributes = []
        self.columns = set()
        self.joins = set()
        self.primary_key_column = None
        self.squash_rules = None
        self.reference_paths = set()
        self.is_static = False

    def add_column(self, column):
        self.columns.add(column)

    def add_join(self, join):
        self.joins.add(join)
