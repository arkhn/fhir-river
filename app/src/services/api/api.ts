import { api as generatedApi } from "./generated/api.generated";

export const api = generatedApi.enhanceEndpoints({
  addEntityTypes: ["Sources", "Resources", "Attributes"],
  endpoints: {
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
    destroySource: {
      invalidates: (_, { id }) => [{ type: "Sources", id }],
    },
    listResources: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Resources" as const, id })),
        { type: "Resources", id: "LIST" },
      ],
    },
    listAttributes: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Attributes" as const, id })),
        { type: "Attributes", id: "LIST" },
      ],
    },
  },
});

export const {
  useListSourcesQuery,
  useCreateSourceMutation,
  useRetrieveSourceQuery,
  useUpdateSourceMutation,
  useDestroySourceMutation,
  useListResourcesQuery,
  useListAttributesQuery,
} = api;
