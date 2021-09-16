import logging
import re
from typing import Any, Dict, Optional

from common.scripts import ScriptsRepository
from river.common.errors import OperationOutcome

from .analysis import Analysis
from .attribute import Attribute
from .concept_map import ConceptMap
from .condition import Condition
from .input_group import InputGroup
from .sql_column import SqlColumn
from .sql_filter import SqlFilter
from .sql_join import SqlJoin

logger = logging.getLogger(__name__)


class Analyzer:
    def __init__(self):
        # Store analyses
        self.analyses: dict = {}
        self.scripts_repo = ScriptsRepository()
        self._cur_analysis = Analysis()
        self._columns_data = {}
        self._owners_data = {}

    def cache_analysis(self, batch_id, resource_id, mappings) -> Analysis:
        cache_key = f"{batch_id}:{resource_id}"
        if cache_key in self.analyses:
            analysis = self.analyses[cache_key]
        else:
            analysis = self.analyze(resource_id, mappings)

            # Store analysis
            self.analyses[cache_key] = analysis

        return analysis

    def load_analysis(self, batch_id, resource_id) -> Optional[Analysis]:
        cache_key = f"{batch_id}:{resource_id}"
        return self.analyses.get(cache_key)

    def analyze(self, resource_id, mappings):
        self._cur_analysis = Analysis()

        # Retrieve col data from mappings
        self._owners_data, self._columns_data = self.retrieve_col_data(mappings)
        # Analyze the mapping
        self.analyze_mapping(resource_id, mappings)

        return self._cur_analysis

    def retrieve_col_data(self, mappings):
        columns_by_id: Dict[str, Dict[str, Any]] = {}
        owner_names_by_id: Dict[str, str] = {}
        for owner in mappings["credential"]["owners"]:
            owner_names_by_id[owner["id"]] = owner["name"]
            for column in owner["columns"]:
                columns_by_id[column["id"]] = {**column, "owner": owner["name"]}

        return owner_names_by_id, columns_by_id

    def analyze_mapping(self, resource_id, mappings):
        try:
            resource_mapping = next(mapping for mapping in mappings["resources"] if mapping["id"] == resource_id)
        except StopIteration:
            raise OperationOutcome(f"resource with id {resource_id} was not found in the provided mapping")

        self._cur_analysis.primary_key_column = self.get_primary_key(resource_mapping)
        self._cur_analysis.source_id = mappings["id"]
        self._cur_analysis.source_credentials = {k: v for k, v in mappings["credential"].items() if k != "owners"}
        self._cur_analysis.resource_id = resource_id
        self._cur_analysis.definition_id = resource_mapping.get("definition_id")
        self._cur_analysis.definition = resource_mapping.get("definition")
        self._cur_analysis.label = resource_mapping.get("label")
        self._cur_analysis.logical_reference = resource_mapping.get("logical_reference")

        for filter_ in resource_mapping["filters"]:
            self.analyze_filter(filter_)
        for attribute_mapping in resource_mapping.get("attributes", []):
            self.analyze_attribute(attribute_mapping)

        return self._cur_analysis

    def analyze_filter(self, filter_):
        col_data = self._columns_data[filter_["sql_column"]]
        sql_col = SqlColumn(col_data["owner"], col_data["table"], col_data["column"])

        filter_joins = self.parse_joins_mapping(col_data["joins"])
        for join in filter_joins:
            sql_col.add_join(join)

        sql_filter = SqlFilter(sql_col, filter_["relation"], filter_["value"])
        self._cur_analysis.add_filter(sql_filter)

    def analyze_attribute(self, attribute_mapping):
        logger.debug(
            {
                "message": f"Analyze attribute {attribute_mapping['path']} {attribute_mapping['definition_id']}",
                "resource_id": self._cur_analysis.resource_id,
            },
        )
        # we need to remove the resource_type from the
        # beginning of the path in order to build the fhir object
        # eg: ("Patient.birthDate" --> "birthDate")
        path = re.sub(
            r"^{resource_type}\.".format(resource_type=self._cur_analysis.definition["type"]),
            "",
            attribute_mapping["path"],
        )
        attribute = Attribute(path=path, definition_id=attribute_mapping["definition_id"])

        if not attribute_mapping["input_groups"]:
            # If there are no input groups for this attribute, it means that it is an
            # intermediary attribute (ie not a leaf). It is here to give us some context
            # information. For instance, we can use it if its children attributes
            # represent a Reference.
            if attribute_mapping["definition_id"] == "Reference":
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

        for mapping_group in attribute_mapping["input_groups"]:
            self.analyze_input_group(mapping_group, attribute)

        self._cur_analysis.attributes.append(attribute)

        return attribute

    def analyze_input_group(self, mapping_group, parent_attribute):
        input_group = InputGroup(id_=mapping_group["id"], attribute=parent_attribute)
        parent_attribute.add_input_group(input_group)
        for static_input in mapping_group["static_inputs"]:
            input_group.add_static_input(static_input["value"])

        for sql_input in mapping_group["sql_inputs"]:
            col_data = self._columns_data[sql_input["column"]]
            cur_col = SqlColumn(col_data["owner"], col_data["table"], col_data["column"])

            if sql_input["script"]:
                try:
                    cur_col.cleaning_script = self.scripts_repo.get(sql_input["script"])
                except NameError as err:
                    logger.exception(f"Error while fetching script {err}.")

            if sql_input["concept_map_id"] and sql_input["concept_map"]:
                cur_col.concept_map = ConceptMap(sql_input["concept_map"], sql_input["concept_map_id"])

            input_joins = self.parse_joins_mapping(col_data["joins"])
            for join in input_joins:
                cur_col.add_join(join)

            input_group.add_column(cur_col)

        for mapping_condition in mapping_group["conditions"]:
            cond_col_data = self._columns_data[mapping_condition["column"]]
            condition_column = SqlColumn(cond_col_data["owner"], cond_col_data["table"], cond_col_data["column"])

            condition_joins = self.parse_joins_mapping(cond_col_data["joins"])
            for join in condition_joins:
                condition_column.add_join(join)

            condition = Condition(
                action=mapping_condition["action"],
                sql_column=condition_column,
                relation=mapping_condition["relation"],
                value=mapping_condition["value"],
            )
            input_group.add_condition(condition)

        if mapping_group["merging_script"]:
            try:
                input_group.merging_script = self.scripts_repo.get(mapping_group["merging_script"])
            except NameError as err:
                logger.exception(f"Error while fetching script {err}.")

        return input_group

    def get_primary_key(self, resource_mapping):
        """Get the primary key table and column of the provided resource."""
        if (
            not resource_mapping.get("primary_key_owner")
            or not resource_mapping.get("primary_key_table")
            or not resource_mapping.get("primary_key_column")
        ):
            return None

        return SqlColumn(
            self._owners_data[resource_mapping["primary_key_owner"]],
            resource_mapping["primary_key_table"],
            resource_mapping["primary_key_column"],
        )

    def parse_joins_mapping(self, joins_mapping: dict):
        joins = []
        for join in joins_mapping:
            columns = join["columns"]
            left_col_data = self._columns_data[columns[0]]
            right_col_data = self._columns_data[columns[1]]

            left = SqlColumn(left_col_data["owner"], left_col_data["table"], left_col_data["column"])
            right = SqlColumn(right_col_data["owner"], right_col_data["table"], right_col_data["column"])
            joins.append(SqlJoin(left, right))

        return joins

    @staticmethod
    def get_analysis_columns(analysis: Analysis):
        analysis_columns = set()
        for attribute in analysis.attributes:
            for input_group in attribute.input_groups:
                for col in input_group.columns:
                    analysis_columns.add(col)

                for condition in input_group.conditions:
                    analysis_columns.add(condition.sql_column)
        for filter in analysis.filters:
            analysis_columns.add(filter.sql_column)

        return analysis_columns

    @staticmethod
    def get_analysis_joins(analysis: Analysis):
        analysis_joins = set()
        for attribute in analysis.attributes:
            for input_group in attribute.input_groups:
                for col in input_group.columns:
                    for join in col.joins:
                        analysis_joins.add(join)

        return analysis_joins
