import { api as generatedApi } from "./generated/api.generated";

export const api = generatedApi.enhanceEndpoints({
  addEntityTypes: ["Sources"],
  endpoints: {
    listSources: {
      provides: (response) =>
        response.map(({ id }) => ({ type: "Sources", id })),
    },
    createSource: {
      invalidates: ["Sources"],
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

export const {
  useListSourcesQuery,
  useCreateSourceMutation,
  useRetrieveSourceQuery,
  useUpdateSourceMutation,
  usePartialUpdateSourceMutation,
  useDestroySourceMutation,
} = api;
