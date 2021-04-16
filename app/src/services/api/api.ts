import {
  api as generatedApi,
  Resource,
  Source,
} from "./generated/api.generated";

export const api = generatedApi.enhanceEndpoints({
  addEntityTypes: ["Sources", "Resources", "Filters"],
  endpoints: {
    //Sources
    listSources: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Sources" as const, id })),
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

    //Resources
    listResources: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Resources" as const, id })),
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

    //Filters
    listFilters: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Resources" as const, id })),
        { type: "Resources", id: "LIST" },
      ],
    },
    createFilter: {
      invalidates: [
        { type: "Filters", id: "LIST" },
        { type: "Resources", id: "LIST" },
      ],
    },
    retrieveFilter: {
      provides: (_, { id }) => [{ type: "Filters", id }],
    },
    updateFilter: {
      invalidates: (_, { id }) => [{ type: "Filters", id }],
    },
    partialUpdateFilter: {
      invalidates: (_, { id }) => [{ type: "Filters", id }],
    },
    destroyFilter: {
      invalidates: (_, { id }) => [{ type: "Filters", id }],
    },
  },
});

const useListSourceResources = (source?: Source) => {
  return api.useListResourcesQuery(
    {},
    {
      selectFromResult: ({ data, ...props }) => ({
        data: data?.filter((resource) => resource.source === source?.id),
        ...props,
      }),
    }
  );
};

const useListSourceAttributes = (source?: Source) => {
  const { data: resources } = useListSourceResources(source);
  const resourceIds = resources?.map(({ id }) => id);
  return api.useListAttributesQuery(
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
};

const useListResourceFilters = (mapping?: Resource) => {
  return api.useListFiltersQuery(
    {},
    {
      selectFromResult: ({ data, ...props }) => ({
        data: data?.filter((filter) => filter.resource === mapping?.id),
        ...props,
      }),
    }
  );
};

export const {
  useListSourcesQuery,
  useCreateSourceMutation,
  useRetrieveSourceQuery,
  useUpdateSourceMutation,
  usePartialUpdateSourceMutation,
  useDestroySourceMutation,
} = api;

export {
  useListSourceResources,
  useListSourceAttributes,
  useListResourceFilters,
};
