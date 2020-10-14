import json
import os
import re
import redis

from analyzer.src.analyze.graphql import PyrogClient
from analyzer.src.config.service_logger import logger

from .analysis import Analysis
from .attribute import Attribute
from .cleaning_script import CleaningScript
from .concept_map import ConceptMap
from .condition import Condition
from .input_group import InputGroup
from .mapping import build_squash_rules
from .merging_script import MergingScript
from .sql_column import SqlColumn
from .sql_filter import SqlFilter
from .sql_join import SqlJoin

FHIR_API_URL = os.getenv("FHIR_API_URL")


class Analyzer:
    def __init__(self, pyrog_client: PyrogClient = None, redis_client: redis.Redis = None):
        self.pyrog = pyrog_client
        self.redis = redis_client
        # Store analyses
        self.analyses: dict = {}

        self._cur_analysis = Analysis()

    def fetch_analysis(self, resource_mapping_id):
        """ Fetch mapping from API """
        if self.pyrog is None:
            raise Exception("Cannot fetch analysis without a Pyrog client")

        logger.info("Fetching mapping from api.", extra={"resource_id": resource_mapping_id})
        resource_mapping = self.pyrog.get_resource_from_id(resource_id=resource_mapping_id)
        return self.analyze(resource_mapping)

    def load_cached_analysis(self, batch_id, resource_id):
        if self.redis is None:
            raise Exception("Cannot use caching without a redis client")

        cache_key = f"{batch_id}:{resource_id}"
        if cache_key in self.analyses:
            analysis = self.analyses[cache_key]
        else:
            # Get mapping from redis
            serialized_mapping = self.redis.get(cache_key)
            # Raise error if mapping wasn't found
            if serialized_mapping is None:
                logger.error(
                    f"Mapping not found for batch {batch_id} and resource {resource_id}",
                    extra={"resource_id": resource_id},
                )

            # Turn serialized mapping into an object
            mapping = json.loads(serialized_mapping)
            analysis = self.analyze(mapping)

            # Store analysis
            self.analyses[cache_key] = analysis

        return analysis

    def analyze(self, resource_mapping):
        self._cur_analysis = Analysis()

        # Analyze the mapping
        self.analyze_mapping(resource_mapping)

        if not self._cur_analysis.columns:
            self._cur_analysis.is_static = True
        else:
            # Add primary key to columns to fetch if needed
            self._cur_analysis.add_column(self._cur_analysis.primary_key_column)

            # Build squash rules
            self._cur_analysis.squash_rules = build_squash_rules(
                self._cur_analysis.columns,
                self._cur_analysis.joins,
                self._cur_analysis.primary_key_column.table_name(),
            )

        return self._cur_analysis

    def analyze_mapping(self, resource_mapping):
        self._cur_analysis.primary_key_column = self.get_primary_key(resource_mapping)
        self._cur_analysis.source_id = resource_mapping["source"]["id"]
        self._cur_analysis.source_credentials = resource_mapping["source"]["credential"]
        self._cur_analysis.resource_id = resource_mapping["id"]
        self._cur_analysis.definition_id = resource_mapping["definitionId"]
        self._cur_analysis.definition = resource_mapping["definition"]
        for filter_ in resource_mapping["filters"]:
            self.analyze_filter(filter_)
        for attribute_mapping in resource_mapping["attributes"]:
            self.analyze_attribute(attribute_mapping)

        return self._cur_analysis

    def analyze_filter(self, filter_):
        col = SqlColumn(
            filter_["sqlColumn"]["table"],
            filter_["sqlColumn"]["column"],
            self._cur_analysis.source_credentials["owner"],
        )
        sql_filter = SqlFilter(col, filter_["relation"], filter_["value"])
        self._cur_analysis.add_filter(sql_filter)

    def analyze_attribute(self, attribute_mapping):
        logger.info(
            f"Analyze attribute {attribute_mapping['path']} {attribute_mapping['definitionId']}",
            extra={"resource_id": self._cur_analysis.resource_id},
        )
        attribute = Attribute(
            path=attribute_mapping["path"], definition_id=attribute_mapping["definitionId"]
        )
        if not attribute_mapping["inputGroups"]:
            # If there are no input groups for this attribute, it means that it is an intermediary
            # attribute (ie not a leaf). It is here to give us some context information.
            # For instance, we can use it if its children attributes represent a Reference.
            if attribute_mapping["definitionId"] == "Reference":
                logger.info(
                    f"Analyze attribute reference",
                    extra={"resource_id": self._cur_analysis.resource_id},
                )
                # Remove trailing index
                path = re.sub(r"\[\d+\]$", "", attribute.path)
                self._cur_analysis.reference_paths.add(path)

            return

        for mapping_group in attribute_mapping["inputGroups"]:
            self.analyze_input_group(mapping_group, attribute)

        self._cur_analysis.attributes.append(attribute)

        return attribute

    def analyze_input_group(self, mapping_group, parent_attribute):
        input_group = InputGroup(id_=mapping_group["id"], attribute=parent_attribute)
        parent_attribute.add_input_group(input_group)
        for input_ in mapping_group["inputs"]:
            if input_["staticValue"]:
                input_group.add_static_input(input_["staticValue"])

            elif input_["sqlValue"] and input_["sqlValue"]["table"]:
                sqlValue = input_["sqlValue"]
                cur_col = SqlColumn(
                    sqlValue["table"],
                    sqlValue["column"],
                    self._cur_analysis.primary_key_column.owner,
                )

                if input_["script"]:
                    cur_col.cleaning_script = CleaningScript(input_["script"])

                if input_["conceptMapId"] and input_["conceptMap"]:
                    cur_col.concept_map = ConceptMap(input_["conceptMap"], input_["conceptMapId"])

                for join in sqlValue["joins"]:
                    tables = join["tables"]
                    left = SqlColumn(
                        tables[0]["table"],
                        tables[0]["column"],
                        self._cur_analysis.primary_key_column.owner,
                    )
                    right = SqlColumn(
                        tables[1]["table"],
                        tables[1]["column"],
                        self._cur_analysis.primary_key_column.owner,
                    )
                    self._cur_analysis.add_join(SqlJoin(left, right))

                self._cur_analysis.add_column(cur_col)
                input_group.add_column(cur_col)

        for mapping_condition in mapping_group["conditions"]:
            condition_column = SqlColumn(
                mapping_condition["sqlValue"]["table"],
                mapping_condition["sqlValue"]["column"],
                self._cur_analysis.primary_key_column.owner,
            )
            self._cur_analysis.add_column(condition_column)

            condition = Condition(
                action=mapping_condition["action"],
                sql_column=condition_column,
                relation=mapping_condition["relation"],
                value=mapping_condition["value"],
            )
            input_group.add_condition(condition)

        if mapping_group["mergingScript"]:
            input_group.merging_script = MergingScript(mapping_group["mergingScript"])

        return input_group

    def get_primary_key(self, resource_mapping):
        """ Get the primary key table and column of the provided resource.
        """
        if not resource_mapping["primaryKeyTable"] or not resource_mapping["primaryKeyColumn"]:
            raise ValueError(
                "You need to provide a primary key table and column in the mapping for "
                f"resource {resource_mapping['definitionId']}."
            )

        return SqlColumn(
            resource_mapping["primaryKeyTable"],
            resource_mapping["primaryKeyColumn"],
            resource_mapping["source"]["credential"]["owner"],
        )
