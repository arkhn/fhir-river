import re
import time

from fhir_transformer.src.analyze.graphql import get_resource_from_id
from fhir_transformer.src.config.logger import create_logger

from .mapping import build_squash_rules
from .analysis import Analysis
from .attribute import Attribute
from .concept_map import ConceptMap
from .cleaning_script import CleaningScript
from .merging_script import MergingScript
from .sql_column import SqlColumn
from .sql_join import SqlJoin

logger = create_logger("analyzer")


class Analyzer:
    def __init__(self):
        # Store analyses
        # TODO think about the design here. Use http caching instead of
        # storing here, for instance?
        self.analyses = {}
        self._cur_analysis = Analysis()
        self.last_updated_at = time.time()

    def refresh_analyser(self, resource_mapping_id, max_seconds_refresh=10):
        """
        This method refreshes the analyser if the last update was later than 4 hours ago.
        :return:
        """

        if time.time() - self.last_updated_at > max_seconds_refresh:
            logger.debug("Analyser too old. Fetching mapping from API...")
            resource_mapping = get_resource_from_id(resource_id=resource_mapping_id)
            self.analyze(resource_mapping)
            logger.debug("Mapping loaded.")

            self.last_updated_at = time.time()
        else:
            logger.debug("Mapping already exists and not too old.")

    def get_analysis(self, resource_mapping_id):
        if resource_mapping_id not in self.analyses:
            logger.debug("Fetching mapping from api.")
            resource_mapping = get_resource_from_id(resource_id=resource_mapping_id)
            self.analyze(resource_mapping)
        else:
            self.refresh_analyser(resource_mapping_id)
        return self.analyses[resource_mapping_id]

    # TODO add an update_analysis(self, resource_mapping_id)?

    def analyze(self, resource_mapping):
        self._cur_analysis.reset()

        # Analyze the mapping
        self.analyze_mapping(resource_mapping)

        if not self._cur_analysis.columns:
            self._cur_analysis.is_static = True
        else:
            # Get primary key table
            self.get_primary_key(resource_mapping)

            # Add primary key to columns to fetch if needed
            self._cur_analysis.add_column(self._cur_analysis.primary_key_column)

            # Build squash rules
            self._cur_analysis.squash_rules = build_squash_rules(
                self._cur_analysis.columns,
                self._cur_analysis.joins,
                self._cur_analysis.primary_key_column.table_name(),
            )

        # Store analysis
        self.analyses[resource_mapping["id"]] = self._cur_analysis

        return self._cur_analysis

    def analyze_mapping(self, resource_mapping):
        self._cur_analysis.source_id = resource_mapping["source"]["id"]
        self._cur_analysis.resource_id = resource_mapping["id"]
        self._cur_analysis.definition = resource_mapping["definition"]
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
                self._cur_analysis.reference_paths.add(path)

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
                    self._cur_analysis.add_join(SqlJoin(left, right))

                self._cur_analysis.add_column(cur_col)
                attribute.add_column(cur_col)

            elif input["staticValue"]:
                attribute.add_static_input(input["staticValue"])

        if attribute_mapping["mergingScript"]:
            attribute.merging_script = MergingScript(attribute_mapping["mergingScript"])

        self._cur_analysis.attributes.append(attribute)

    def get_primary_key(self, resource_mapping):
        """ Get the primary key table and column of the provided resource.
        """
        if not resource_mapping["primaryKeyTable"] or not resource_mapping["primaryKeyColumn"]:
            raise ValueError(
                "You need to provide a primary key table and column in the mapping for "
                f"resource {resource_mapping['definitionId']}."
            )

        self._cur_analysis.primary_key_column = SqlColumn(
            resource_mapping["primaryKeyTable"],
            resource_mapping["primaryKeyColumn"],
            resource_mapping["primaryKeyOwner"],
        )
