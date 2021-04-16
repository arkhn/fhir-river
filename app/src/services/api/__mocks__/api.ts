import {
  Source,
  Resource,
  Attribute,
} from "services/api/generated/api.generated";

const api = jest.requireActual("../api");

const sources: Source[] = [
  {
    id: "source_1",
    name: "source_name_1",
  },
  {
    id: "source_2",
    name: "source_name_2",
  },
];

const mappings: Resource[] = [
  {
    id: "mapping_1",
    primary_key_table: "table",
    primary_key_column: "column",
    primary_key_owner: "owner",
    definition_id: "definition_1",
    source: "source_1",
    logical_reference: "logical_reference",
  },
  {
    id: "mapping_2",
    primary_key_table: "table",
    primary_key_column: "column",
    primary_key_owner: "owner",
    definition_id: "definition_2",
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

api.useListSourcesQuery = ({}) => {
  return {
    data: sources,
    isLoading: false,
  };
};

api.deleteSourceMock = jest.fn();
api.useDestroySourceMutation = () => {
  return [api.deleteSourceMock];
};

api.createSourceMock = jest.fn((source: Source) => ({
  unwrap: jest.fn().mockResolvedValue(source),
}));

api.useCreateSourceMutation = () => {
  return [api.createSourceMock, { isLoading: false }];
};

api.updateSourceMock = jest.fn((source: Source) => ({
  unwrap: jest.fn().mockResolvedValue(source),
}));
api.useUpdateSourceMutation = () => {
  return [api.updateSourceMock, { isLoading: false }];
};

api.useRetrieveSourceQuery = (params: { id: string }) => {
  return { data: sources.find(({ id }) => id === params.id) };
};

module.exports = api;