import { api as generatedApi } from "./generated/api.generated";

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
      invalidates: (_, { resource }) => [
        { type: "Resources", id: "LIST" },
        { type: "Sources", id: resource.source },
      ],
    },
    retrieveResource: {
      provides: (response, { id }) => [{ type: "Resources", id }],
    },
    updateResource: {
      invalidates: (_, { id }) => [{ type: "Resources", id }],
    },
    partialUpdateResource: {
      invalidates: (_, { id }) => [{ type: "Resources", id }],
    },
    destroyResource: {
      invalidates: (_, { id }) => [
        { type: "Resources", id },
        { type: "Sources", id: "LIST" },
      ],
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
      invalidates: (_, { attribute }) => [
        { type: "Attributes", id: "LIST" },
        { type: "Resources", id: attribute.resource },
      ],
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
      invalidates: (_, { id }) => [
        { type: "Attributes", id },
        { type: "Resources", id: "LIST" },
      ],
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
  useListResourcesQuery,
  useCreateResourceMutation,
  useRetrieveResourceQuery,
  useUpdateResourceMutation,
  usePartialUpdateResourceMutation,
  useDestroyResourceMutation,
  useListAttributesQuery,
  useCreateAttributeMutation,
  useRetrieveAttributeQuery,
  useUpdateAttributeMutation,
  usePartialUpdateAttributeMutation,
  useDestroyAttributeMutation,
} = api;
