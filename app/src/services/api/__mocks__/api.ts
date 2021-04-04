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
    updatedAt: "2021-03-30T12:34:10.375068+02:00",
    createdAt: "2021-03-30T12:34:10.375068+02:00",
  },
  {
    id: "source_2",
    name: "source_name_2",
    updatedAt: "2021-03-30T12:34:10.375068+02:00",
    createdAt: "2021-03-30T12:34:10.375068+02:00",
  },
];

const mappings: Resource[] = [
  {
    id: "mapping_1",
    primaryKeyTable: "table",
    primaryKeyColumn: "column",
    primaryKeyOwner: "owner",
    definitionId: "definition",
    source: "source_1",
    logicalReference: "logical_reference",
    updatedAt: "2021-03-30T12:34:10.375068+02:00",
    createdAt: "2021-03-30T12:34:10.375068+02:00",
  },
  {
    id: "mapping_2",
    primaryKeyTable: "table",
    primaryKeyColumn: "column",
    primaryKeyOwner: "owner",
    definitionId: "definition",
    source: "source_1",
    logicalReference: "logical_reference",
    updatedAt: "2021-03-30T12:34:10.375068+02:00",
    createdAt: "2021-03-30T12:34:10.375068+02:00",
  },
];

const attributes: Attribute[] = [
  {
    id: "attribute_1",
    path: "path",
    definitionId: "definition",
    resource: "mapping_1",
    updatedAt: "2021-03-30T12:34:10.375068+02:00",
    createdAt: "2021-03-30T12:34:10.375068+02:00",
  },
  {
    id: "attribute_2",
    path: "path",
    definitionId: "definition",
    resource: "mapping_2",
    updatedAt: "2021-03-30T12:34:10.375068+02:00",
    createdAt: "2021-03-30T12:34:10.375068+02:00",
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

module.exports = api;
