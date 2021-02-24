import { api as generatedApi, Source } from "./generated/api.generated";

export const api = generatedApi.enhanceEndpoints({
  addEntityTypes: ["Sources", "Resources", "Attributes"],
  endpoints: {
    listSources: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Sources" as "Sources", id })),
        { type: "Sources", id: "LIST" },
      ],
    },
    createSource: {
      invalidates: [{ type: "Sources", id: "LIST" }],
    },
    retrieveSource: {
      provides: (_, { id }) => [{ type: "Sources", id }],
    },
    updateSource: {
      invalidates: (_, { id }) => [{ type: "Sources", id }],
    },
    partialUpdateSource: {
      invalidates: (_, { id }) => [{ type: "Sources", id }],
    },
    destroySource: {
      invalidates: (_, { id }) => [{ type: "Sources", id }],
    },
    listResources: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Resources" as "Resources", id })),
        { type: "Resources", id: "LIST" },
      ],
    },
    createResource: {
      invalidates: [{ type: "Resources", id: "LIST" }],
    },
    retrieveResource: {
      provides: (_, { id }) => [{ type: "Resources", id }],
    },
    updateResource: {
      invalidates: (_, { id }) => [{ type: "Resources", id }],
    },
    partialUpdateResource: {
      invalidates: (_, { id }) => [{ type: "Resources", id }],
    },
    destroyResource: {
      invalidates: (_, { id }) => [{ type: "Resources", id }],
    },
    listAttributes: {
      provides: (response) => [
        ...response.map(({ id }) => ({
          type: "Attributes" as "Attributes",
          id,
        })),
        { type: "Attributes", id: "LIST" },
      ],
    },
    createAttribute: {
      invalidates: [{ type: "Attributes", id: "LIST" }],
    },
    retrieveAttribute: {
      provides: (_, { id }) => [{ type: "Attributes", id }],
    },
    updateAttribute: {
      invalidates: (_, { id }) => [{ type: "Attributes", id }],
    },
    partialUpdateAttribute: {
      invalidates: (_, { id }) => [{ type: "Attributes", id }],
    },
    destroyAttribute: {
      invalidates: (_, { id }) => [{ type: "Attributes", id }],
    },
  },
});

const useListSourceResources = (source: Source) => {
  const response = api.useListResourcesQuery(
    {},
    {
      selectFromResult: ({ data, ...props }) => ({
        data: data?.filter((resource) => resource.source === source.id),
        ...props,
      }),
    }
  );
  return response;
};

const useListSourceAttributes = (source: Source) => {
  const { data: resources } = useListSourceResources(source);
  const resourceIds = resources?.map(({ id }) => id);
  const response = api.useListAttributesQuery(
    {},
    {
      selectFromResult: ({ data, ...props }) => ({
        data: data?.filter((attribute) =>
          resourceIds?.includes(attribute.resource)
        ),
        ...props,
      }),
    }
  );
  return response;
};

export const {
  useListSourcesQuery,
  useCreateSourceMutation,
  useRetrieveSourceQuery,
  useUpdateSourceMutation,
  usePartialUpdateSourceMutation,
  useDestroySourceMutation,
} = api;

export { useListSourceResources, useListSourceAttributes };
