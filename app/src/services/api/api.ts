import { api as generatedApi } from "./generated/api.generated";

export const api = generatedApi.enhanceEndpoints({
  addEntityTypes: ["Sources", "Resources"],
  endpoints: {
    listSources: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Sources" as "Sources", id })),
        { type: "Sources", id: "LIST" },
        ...response.reduce(
          (acc, source) =>
            source.resources
              ? [
                  ...acc,
                  ...source.resources.map(({ id }) => ({
                    type: "Resources" as "Resources",
                    id,
                  })),
                ]
              : acc,
          [] as { type: "Resources"; id: string | undefined }[]
        ),
      ],
    },
    createSource: {
      invalidates: [{ type: "Sources", id: "LIST" }],
    },
    retrieveSource: {
      provides: (response, { id }) =>
        response.resources
          ? [
              { type: "Sources", id },
              ...response.resources.map(({ id }) => ({
                type: "Resources" as "Resources",
                id,
              })),
            ]
          : [{ type: "Sources", id }],
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
      invalidates: (_, { resource }) => [
        { type: "Resources", id: "LIST" },
        { type: "Sources", id: resource.source },
      ],
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
  },
});

export const {
  useListSourcesQuery,
  useCreateSourceMutation,
  useRetrieveSourceQuery,
  useUpdateSourceMutation,
  usePartialUpdateSourceMutation,
  useDestroySourceMutation,
} = api;
