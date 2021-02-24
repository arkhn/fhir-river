import { api as generatedApi, Source } from "./generated/api.generated";

export const api = generatedApi.enhanceEndpoints({
  addEntityTypes: ["Sources"],
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
