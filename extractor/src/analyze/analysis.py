from typing import List, Set

from extractor.src.analyze.sql_column import SqlColumn
from extractor.src.analyze.sql_join import SqlJoin
from extractor.src.analyze.attribute import Attribute


class Analysis:
    def __init__(self):
        self.attributes: List[Attribute] = []
        self.columns: Set[SqlColumn] = set()
        self.joins: Set[SqlJoin] = set()
        self.primary_key_column: SqlColumn = None
        self.squash_rules = None
        self.reference_paths: Set[str] = set()
        self.is_static = False

    def reset(self):
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
