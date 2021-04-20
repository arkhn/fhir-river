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
        providesTags: (response) =>
          response
            ? [
                ...response.map(({ id }) => ({ type: "Sources" as const, id })),
                { type: "Sources", id: "LIST" },
              ]
            : [{ type: "Sources", id: "LIST" }],
      },
      apiSourcesCreate: {
        invalidatesTags: [{ type: "Sources", id: "LIST" }],
      },
      apiSourcesRetrieve: {
        providesTags: (_response, _error, { id }) => [{ type: "Sources", id }],
      },
      apiSourcesUpdate: {
        invalidatesTags: (_response, _error, { id }) => [
          { type: "Sources", id },
        ],
      },
      apiSourcesDestroy: {
        invalidatesTags: (_response, _error, { id }) => [
          { type: "Sources", id },
        ],
      },
      apiResourcesList: {
        providesTags: (response) =>
          response
            ? [
                ...response.map(({ id }) => ({
                  type: "Resources" as const,
                  id,
                })),
                { type: "Resources", id: "LIST" },
              ]
            : [{ type: "Resources", id: "LIST" }],
      },
      apiAttributesList: {
        providesTags: (response) =>
          response
            ? [
                ...response.map(({ id }) => ({
                  type: "Attributes" as const,
                  id,
                })),
                { type: "Attributes", id: "LIST" },
              ]
            : [{ type: "Attributes", id: "LIST" }],
      },
      apiOwnersList: {
        providesTags: (response) =>
          response
            ? [
                ...response.map(({ id }) => ({ type: "Owners" as const, id })),
                { type: "Owners", id: "LIST" },
              ]
            : [{ type: "Owners", id: "LIST" }],
      },
      apiOwnersCreate: {
        invalidatesTags: [{ type: "Owners", id: "LIST" }],
      },
      apiOwnersDestroy: {
        invalidatesTags: (_response, _error, { id }) => [
          { type: "Owners", id },
        ],
      },
      apiCredentialsList: {
        providesTags: (response) =>
          response
            ? [
                ...response.map(({ id }) => ({
                  type: "Credentials" as const,
                  id,
                })),
                { type: "Credentials", id: "LIST" },
              ]
            : [{ type: "Credentials", id: "LIST" }],
      },
      apiCredentialsCreate: {
        invalidatesTags: [{ type: "Credentials", id: "LIST" }],
      },
      apiCredentialsRetrieve: {
        providesTags: (_response, _error, { id }) => [
          { type: "Credentials", id },
        ],
      },
      apiCredentialsUpdate: {
        invalidatesTags: (_response, _error, { id }) => [
          { type: "Credentials", id },
        ],
      },
      apiUserRetrieve: {
        providesTags: ["User"],
      },
      oidcLogout: {
        invalidatesTags: ["User"],
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
