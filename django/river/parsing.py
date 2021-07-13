from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4

from pydantic import BaseModel as PydanticBaseModel
from pydantic import Field


class BaseModel(PydanticBaseModel):
    class Config:
        extra = "forbid"


class Join(BaseModel):
    columns: Tuple[str, str]


class Column(BaseModel):
    id: str
    table: str
    column: str
    joins: List[Join]


class Input(BaseModel):
    script: str
    concept_map_id: str
    static_value: Any
    column: Optional[str]


class Condition(BaseModel):
    action: str
    column: str
    value: str = ""
    relation: str


class InputGroup(BaseModel):
    merging_script: str
    inputs: List[Input]
    conditions: List[Condition]


class Comment(BaseModel):
    pass


class Attribute(BaseModel):
    path: str
    slice_name: str
    definition_id: str
    input_groups: List[InputGroup]
    comments: List[Comment] = []


class Filter(BaseModel):
    relation: str
    value: str
    sql_column: str


class Definition(BaseModel):
    class Config:
        extra = "allow"

    id: str


class Resource(BaseModel):
    # Not sure we actually care about the usual id.
    # For now, use a randomly generated id
    id: str = str(uuid4())
    label: str
    primary_key_table: Optional[str] = None
    primary_key_column: Optional[str] = None
    primary_key_owner: Optional[str] = None
    definition_id: str
    logical_reference: str
    attributes: List[Attribute] = []
    filters: List[Filter]
    definition: Definition  # ?


class Owner(BaseModel):
    id: str
    name: str
    schema_: str = Field(alias="schema")
    columns: List[Column]


class Credential(BaseModel):
    host: str
    port: int
    database: str
    model: str
    login: str = ""
    password: str = ""
    owners: List[Owner]


class Source(BaseModel):
    id: str
    name: str
    version: str
    resources: List[Resource]
    credential: Credential


def as_old_mapping(source: Source, resource_id: str):
    resource = next(r for r in source.resources if r.id == resource_id)

    # Flatten owners->columns to search through all columns
    columns_by_id: Dict[str, Tuple[Column, Owner]] = {}
    for owner in source.credential.owners:
        for column in owner.columns:
            columns_by_id[column.id] = (column, owner)

    def serialize_column(column_id) -> dict:
        column, owner = columns_by_id[column_id]
        return {
            "id": column.id,
            "column": column.column,
            "table": column.table,
            "joins": [{"tables": [serialize_column(column) for column in join.columns]} for join in column.joins],
            "owner": {
                "name": owner.name,
            },
        }

    old_mapping = {
        "id": resource.id,
        "logicalReference": resource.logical_reference,
        "primaryKeyOwner": {"name": resource.primary_key_owner},
        "primaryKeyTable": resource.primary_key_table,
        "primaryKeyColumn": resource.primary_key_column,
        "definitionId": None,  # TODO: ??
        "source": {
            "id": source.id,  # TODO: add this field to exported mappings
            "name": source.name,
            "version": source.version or None,
            "credential": {
                **source.credential.dict(exclude={"owners"}),
                "owner": None,
            },
        },
        "attributes": [
            {
                "path": attribute.path,
                "definitionId": attribute.definition_id,
                "inputGroups": [
                    {
                        "id": "NOT_AN_ACTUAL_VALUE",  # TODO: add this field to exported mappings
                        "mergingScript": input_group.merging_script or None,
                        "inputs": [
                            {
                                "script": input_.script or None,
                                "conceptMapId": input_.concept_map_id or None,
                                "conceptMap": None,  # TODO: ??
                                "staticValue": input_.static_value,
                                "sqlValue": serialize_column(input_.column) if input_.column != "" else None,
                            }
                            for input_ in input_group.inputs
                        ],
                        "conditions": [
                            {
                                "action": condition.action,
                                "sqlValue": serialize_column(condition.column),
                                "relation": condition.relation,
                                "value": condition.value,
                            }
                            for condition in input_group.conditions
                        ],
                    }
                    for input_group in attribute.input_groups
                ],
            }
            for attribute in resource.attributes
        ],
        "filters": [
            {
                "sqlColumn": serialize_column(filter.sql_column),
                "relation": filter.relation,
                "value": filter.value,
            }
            for filter in resource.filters
        ],
        "definition": dict(resource.definition),  # TODO: add this field to the exported mappings
    }

    return old_mapping