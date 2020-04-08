import re

from .mapping import build_squash_rules
from .analysis import Analysis
from .attribute import Attribute
from .concept_map import ConceptMap
from .cleaning_script import CleaningScript
from .merging_script import MergingScript
from .sql_column import SqlColumn
from .sql_join import SqlJoin


class Analyzer:
    def __init__(self):
        self.analysis = Analysis()

    def analyze(self, resource_mapping):
        self.analysis.reset()

        # Analyze the mapping
        self.analyze_mapping(resource_mapping)

        if not self.analysis.columns:
            self.analysis.is_static = True
        else:
            # Get primary key table
            self.get_primary_key(resource_mapping)

            # Add primary key to columns to fetch if needed
            self.analysis.add_column(self.analysis.primary_key_column)

            # Build squash rules
            self.analysis.squash_rules = build_squash_rules(
                self.analysis.columns,
                self.analysis.joins,
                self.analysis.primary_key_column.table_name(),
            )

        return self.analysis

    def analyze_mapping(self, resource_mapping):
        for attribute_mapping in resource_mapping["attributes"]:
            self.analyze_attribute(attribute_mapping)

    def analyze_attribute(self, attribute_mapping):
        attribute = Attribute(
            path=attribute_mapping["path"], columns=[], static_inputs=[], merging_script=None
        )
        if not attribute_mapping["inputs"]:
            # If there are no inputs for this attribute, it means that it is an intermediary
            # attribute (ie not a leaf). It is here to give us some context information.
            # For instance, we can use it if its children attributes represent a Reference.
            if attribute_mapping["definitionId"] == "Reference":
                # Remove index
                path = re.sub(r"\[\d+\]$", "", attribute.path)
                self.analysis.reference_paths.add(path)

            return

        for input in attribute_mapping["inputs"]:
            if input["sqlValue"]:
                sqlValue = input["sqlValue"]
                cur_col = SqlColumn(sqlValue["table"], sqlValue["column"], sqlValue["owner"])

                if input["script"]:
                    cur_col.cleaning_script = CleaningScript(input["script"])

                if input["conceptMapId"]:
                    cur_col.concept_map = ConceptMap(input["conceptMapId"])

                for join in sqlValue["joins"]:
                    tables = join["tables"]
                    left = SqlColumn(tables[0]["table"], tables[0]["column"], tables[0]["owner"])
                    right = SqlColumn(tables[1]["table"], tables[1]["column"], tables[1]["owner"])
                    self.analysis.add_join(SqlJoin(left, right))

                self.analysis.add_column(cur_col)
                attribute.add_column(cur_col)

            elif input["staticValue"]:
                attribute.add_static_input(input["staticValue"])

        if attribute_mapping["mergingScript"]:
            attribute.merging_script = MergingScript(attribute_mapping["mergingScript"])

        self.analysis.attributes.append(attribute)

    def get_primary_key(self, resource_mapping):
        """ Get the primary key table and column of the provided resource.
        """
        if not resource_mapping["primaryKeyTable"] or not resource_mapping["primaryKeyColumn"]:
            raise ValueError(
                "You need to provide a primary key table and column in the mapping for "
                f"resource {resource_mapping['definitionId']}."
            )

        self.analysis.primary_key_column = SqlColumn(
            resource_mapping["primaryKeyTable"],
            resource_mapping["primaryKeyColumn"],
            resource_mapping["primaryKeyOwner"],
        )
