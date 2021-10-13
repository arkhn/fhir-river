from typing import Dict, List, Optional

from river.common.analyzer.attribute import Attribute
from river.common.analyzer.sql_column import SqlColumn
from river.common.analyzer.sql_filter import SqlFilter


class Analysis:
    def __init__(self):
        self.project_id: str = None
        self.project_credentials: Dict = None
        self.resource_id: str = None
        self.definition_id: str = None
        self.definition: str = None
        self.label: str = None
        self.definition: Dict = None
        self.attributes: List[Attribute] = []
        self.filters: List[SqlFilter] = []
        self.primary_key_column: Optional[SqlColumn] = None
        self.logical_reference: str = None
        self.reference_paths: List[List[str]] = []
        self.is_static = False

    def add_filter(self, filter_):
        self.filters.append(filter_)
