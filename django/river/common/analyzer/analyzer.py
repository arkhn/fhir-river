import logging
import re

from river.adapters.scripts_repository import MemoryScriptsRepository, ScriptsRepository

from .analysis import Analysis
from .attribute import Attribute
from .cleaning_script import CleaningScript
from .concept_map import ConceptMap
from .condition import Condition
from .input_group import InputGroup
from .merging_script import MergingScript
from .sql_column import SqlColumn
from .sql_filter import SqlFilter
from .sql_join import SqlJoin

logger = logging.getLogger(__name__)


class Analyzer:
    def __init__(self):
        # Store analyses
        self.analyses: dict = {}
        self.scripts_repo: ScriptsRepository = MemoryScriptsRepository()
        self._cur_analysis = Analysis()

    def load_cached_analysis(self, batch_id, resource_id, mapping):
        cache_key = f"{batch_id}:{resource_id}"
        if cache_key in self.analyses:
            analysis = self.analyses[cache_key]
        else:
            analysis = self.analyze(mapping)

            # Store analysis
            self.analyses[cache_key] = analysis

        return analysis

    def analyze(self, resource_mapping):
        self._cur_analysis = Analysis()

        # Analyze the mapping
        self.analyze_mapping(resource_mapping)

        return self._cur_analysis

    def analyze_mapping(self, resource_mapping):
        self._cur_analysis.primary_key_column = self.get_primary_key(resource_mapping)
        self._cur_analysis.source_id = resource_mapping["source"]["id"]
        self._cur_analysis.source_credentials = resource_mapping["source"]["credential"]
        self._cur_analysis.resource_id = resource_mapping["id"]
        self._cur_analysis.definition_id = resource_mapping.get("definitionId")
        self._cur_analysis.definition = resource_mapping.get("definition")
        self._cur_analysis.label = resource_mapping.get("label")
        self._cur_analysis.logical_reference = resource_mapping.get("logicalReference")

        for filter_ in resource_mapping["filters"]:
            self.analyze_filter(filter_)
        for attribute_mapping in resource_mapping.get("attributes", []):
            self.analyze_attribute(attribute_mapping)

        return self._cur_analysis

    def analyze_filter(self, filter_):
        col = SqlColumn(
            filter_["sqlColumn"]["owner"]["name"], filter_["sqlColumn"]["table"], filter_["sqlColumn"]["column"]
        )

        filter_joins = self.parse_joins_mapping(filter_["sqlColumn"]["joins"])
        for join in filter_joins:
            col.add_join(join)

        sql_filter = SqlFilter(col, filter_["relation"], filter_["value"])
        self._cur_analysis.add_filter(sql_filter)

    def analyze_attribute(self, attribute_mapping):
        logger.debug(
            {
                "message": f"Analyze attribute {attribute_mapping['path']} {attribute_mapping['definitionId']}",
                "resource_id": self._cur_analysis.resource_id,
            },
        )
        attribute = Attribute(path=attribute_mapping["path"], definition_id=attribute_mapping["definitionId"])
        if not attribute_mapping["inputGroups"]:
            # If there are no input groups for this attribute, it means that it is an
            # intermediary attribute (ie not a leaf). It is here to give us some context
            # information. For instance, we can use it if its children attributes
            # represent a Reference.
            if attribute_mapping["definitionId"] == "Reference":
                logger.debug(
                    {"message": "Analyze attribute reference", "resource_id": self._cur_analysis.resource_id},
                )
                # Remove trailing index
                clean_path = re.sub(r"\[\d+\]$", "", attribute.path)
                # Anlysis.reference_paths is a list of lists of strings.
                # We chose to represent paths to references as list of strings to handle
                # arrays of references. For instance, if we find a reference at
                # item[0].answer[0].valueReference in the mapping, we want to bind all
                # the references at item[*].answer[*].valueReference. To make this task
                # easier in the ReferenceBinder, we represent this path as
                # ["item", "answer", "valueReference"].
                path = re.split(r"\[\d+\].", clean_path)
                self._cur_analysis.reference_paths.append(path)

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
                cur_col = SqlColumn(sqlValue["owner"]["name"], sqlValue["table"], sqlValue["column"])

                if input_["script"]:
                    try:
                        script = self.scripts_repo.get(input_["script"])
                        cur_col.cleaning_script = CleaningScript(script)
                    except NameError as err:
                        logger.exception(f"Error while fetching script {err}.")

                if input_["conceptMapId"] and input_["conceptMap"]:
                    cur_col.concept_map = ConceptMap(input_["conceptMap"], input_["conceptMapId"])

                input_joins = self.parse_joins_mapping(sqlValue["joins"])
                for join in input_joins:
                    cur_col.add_join(join)

                input_group.add_column(cur_col)

        for mapping_condition in mapping_group["conditions"]:
            condition_column = SqlColumn(
                mapping_condition["sqlValue"]["owner"]["name"],
                mapping_condition["sqlValue"]["table"],
                mapping_condition["sqlValue"]["column"],
            )

            condition_joins = self.parse_joins_mapping(mapping_condition["sqlValue"]["joins"])
            for join in condition_joins:
                condition_column.add_join(join)

            condition = Condition(
                action=mapping_condition["action"],
                sql_column=condition_column,
                relation=mapping_condition["relation"],
                value=mapping_condition["value"],
            )
            input_group.add_condition(condition)

        if mapping_group["mergingScript"]:
            try:
                script = self.scripts_repo.get(mapping_group["mergingScript"])
                input_group.merging_script = MergingScript(script)
            except NameError as err:
                logger.exception(f"Error while fetching script {err}.")

        return input_group

    def get_primary_key(self, resource_mapping):
        """Get the primary key table and column of the provided resource."""
        if (
            not resource_mapping.get("primaryKeyOwner")
            or not resource_mapping.get("primaryKeyTable")
            or not resource_mapping.get("primaryKeyColumn")
        ):
            return None

        return SqlColumn(
            resource_mapping["primaryKeyOwner"]["name"],
            resource_mapping["primaryKeyTable"],
            resource_mapping["primaryKeyColumn"],
        )

    def parse_joins_mapping(self, joins_mapping: dict):
        joins = []
        for join in joins_mapping:
            tables = join["tables"]
            left = SqlColumn(tables[0]["owner"]["name"], tables[0]["table"], tables[0]["column"])
            right = SqlColumn(tables[1]["owner"]["name"], tables[1]["table"], tables[1]["column"])
            joins.append(SqlJoin(left, right))

        return joins

    @staticmethod
    def get_analysis_columns(analysis):
        analysis_columns = set()
        for attribute in analysis.attributes:
            for input_group in attribute.input_groups:
                for col in input_group.columns:
                    analysis_columns.add(col)

                for condition in input_group.conditions:
                    analysis_columns.add(condition.sql_column)

        return analysis_columns

    @staticmethod
    def get_analysis_joins(analysis):
        analysis_joins = set()
        for attribute in analysis.attributes:
            for input_group in attribute.input_groups:
                for col in input_group.columns:
                    for join in col.joins:
                        analysis_joins.add(join)

        return analysis_joins
