import { api as generatedApi } from "./generated/api.generated";

export const api = generatedApi
  .injectEndpoints({
    endpoints: (build) => ({
      oidcLogout: build.mutation({
        query: () => ({
          url: `/oidc/logout/`,
          method: "POST",
        }),
      }),
    }),
  })
  .enhanceEndpoints({
    addEntityTypes: [
      "Sources",
      "Resources",
      "Attributes",
      "Owners",
      "Credentials",
      "User",
    ],
    endpoints: {
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
      apiResourcesList: {
        provides: (response) => [
          ...response.map(({ id }) => ({ type: "Resources" as const, id })),
          { type: "Resources", id: "LIST" },
        ],
      },
      apiAttributesList: {
        provides: (response) => [
          ...response.map(({ id }) => ({ type: "Attributes" as const, id })),
          { type: "Attributes", id: "LIST" },
        ],
      },
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
      apiUserRetrieve: {
        provides: ({ id }) => [{ type: "User", id }],
      },
      oidcLogout: {
        invalidates: ["User"],
      },
    },
  });

export const {
  useOidcLogoutMutation,
  useApiSourcesListQuery,
  useApiSourcesCreateMutation,
  useApiSourcesRetrieveQuery,
  useApiSourcesUpdateMutation,
  useApiSourcesDestroyMutation,
  useApiResourcesListQuery,
  useApiAttributesListQuery,
  useApiOwnersListQuery,
  useApiOwnersCreateMutation,
  useApiOwnersDestroyMutation,
  useApiCredentialsListQuery,
  useApiCredentialsCreateMutation,
  useApiCredentialsRetrieveQuery,
  useApiCredentialsUpdateMutation,
  useApiUserRetrieveQuery,
} = api;
