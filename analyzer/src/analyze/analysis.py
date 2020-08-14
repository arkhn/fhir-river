from typing import Dict, List, Set

from analyzer.src.analyze.attribute import Attribute
from analyzer.src.analyze.sql_column import SqlColumn
from analyzer.src.analyze.sql_join import SqlJoin
from analyzer.src.analyze.sql_filter import SqlFilter


class Analysis:
    def __init__(self):
        self.source_id: str = None
        self.source_credentials: Dict = None
        self.resource_id: str = None
        self.definition_id: str = None
        self.definition: Dict = None
        self.attributes: List[Attribute] = []
        self.columns: Set[SqlColumn] = set()
        self.joins: Set[SqlJoin] = set()
        self.filters: Set[SqlFilter] = set()
        self.primary_key_column: SqlColumn = None
        self.squash_rules = None
        self.reference_paths: Set[str] = set()
        self.is_static = False

    def add_column(self, column):
        self.columns.add(column)

    def add_join(self, join):
        self.joins.add(join)

    def add_filter(self, filter_):
        self.filters.add(filter_)
