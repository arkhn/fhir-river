import { api as generatedApi } from "./generated/api.generated";

export const api = generatedApi.enhanceEndpoints({
  addEntityTypes: [
    "Sources",
    "Resources",
    "Attributes",
    "Owners",
    "Credentials",
    "Filters",
  ],
  endpoints: {
    /**
     *  Sources
     */
    apiSourcesList: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Sources" as const, id })),
        { type: "Sources", id: "LIST" },
      ],
    },
    apiSourcesCreate: {
      invalidates: [{ type: "Sources", id: "LIST" }],
    },
    apiSourcesRetrieve: {
      provides: (_, { id }) => [{ type: "Sources", id }],
    },
    apiSourcesUpdate: {
      invalidates: (_, { id }) => [{ type: "Sources", id }],
    },
    apiSourcesDestroy: {
      invalidates: (_, { id }) => [{ type: "Sources", id }],
    },

    /**
     * Resources
     */
    apiResourcesList: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Resources" as const, id })),
        { type: "Resources", id: "LIST" },
      ],
    },
    apiResourcesCreate: {
      invalidates: [{ type: "Resources", id: "LIST" }],
    },

    /**
     * Attributes
     */
    apiAttributesList: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Attributes" as const, id })),
        { type: "Attributes", id: "LIST" },
      ],
    },

    /**
     * Owners
     */
    apiOwnersList: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Owners" as const, id })),
        { type: "Owners", id: "LIST" },
      ],
    },
    apiOwnersCreate: {
      invalidates: [{ type: "Owners", id: "LIST" }],
    },
    apiOwnersDestroy: {
      invalidates: (_, { id }) => [{ type: "Owners", id }],
    },

    /**
     * Credentials
     */
    apiCredentialsList: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Credentials" as const, id })),
        { type: "Credentials", id: "LIST" },
      ],
    },
    apiCredentialsCreate: {
      invalidates: [{ type: "Credentials", id: "LIST" }],
    },
    apiCredentialsRetrieve: {
      provides: (_, { id }) => [{ type: "Credentials", id }],
    },
    apiCredentialsUpdate: {
      invalidates: (_, { id }) => [{ type: "Credentials", id }],
    },

    /**
     * Filters
     */
    apiFiltersList: {
      provides: (response) => [
        ...response.map(({ id }) => ({ type: "Filters" as const, id })),
        { type: "Filters", id: "LIST" },
      ],
    },
    apiFiltersCreate: {
      invalidates: [{ type: "Filters", id: "LIST" }],
    },
  },
});

export const {
  // Sources
  useApiSourcesListQuery,
  useApiSourcesCreateMutation,
  useApiSourcesRetrieveQuery,
  useApiSourcesUpdateMutation,
  useApiSourcesDestroyMutation,
  // Resources
  useApiResourcesListQuery,
  useApiResourcesCreateMutation,
  // Attributes
  useApiAttributesListQuery,
  // Owners
  useApiOwnersListQuery,
  useApiOwnersCreateMutation,
  useApiOwnersDestroyMutation,
  // Credentials
  useApiCredentialsListQuery,
  useApiCredentialsCreateMutation,
  useApiCredentialsRetrieveQuery,
  useApiCredentialsUpdateMutation,
  // Filters
  useApiFiltersListQuery,
  useApiFiltersCreateMutation,
} = api;
