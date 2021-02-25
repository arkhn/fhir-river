import {
  Source,
  Resource,
  Attribute,
} from "services/api/generated/api.generated";

const api = jest.requireActual("../api");

const mappings: Resource[] = [
  {
    id: "mapping_1",
    primary_key_table: "table",
    primary_key_column: "column",
    primary_key_owner: "owner",
    definition_id: "definition",
    source: "source_1",
    logical_reference: "logical_reference",
  },
  {
    id: "mapping_2",
    primary_key_table: "table",
    primary_key_column: "column",
    primary_key_owner: "owner",
    definition_id: "definition",
    source: "source_1",
    logical_reference: "logical_reference",
  },
];

const attributes: Attribute[] = [
  {
    id: "attribute_1",
    path: "path",
    definition_id: "definition",
    resource: "mapping_1",
  },
  {
    id: "attribute_2",
    path: "path",
    definition_id: "definition",
    resource: "mapping_2",
  },
];

api.useListSourceResources = (_: Source) => {
  return {
    data: mappings,
    isLoading: false,
  };
};

api.useListSourceAttributes = (_: Source) => {
  return {
    data: attributes,
    isLoading: false,
  };
};

module.exports = api;
