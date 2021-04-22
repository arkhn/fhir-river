import {
  providesList,
  providesOne,
  invalidatesList,
  invalidatesOne,
} from "./cache";
import { api as generatedApi } from "./generated/api.generated";

const entityTypes = [
  "Sources",
  "Resources",
  "Attributes",
  "Owners",
  "Credentials",
  "Filters",
  "User",
];

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
    addEntityTypes: entityTypes,
    endpoints: {
      /**
       *  Sources
       */
      apiSourcesList: {
        providesTags: providesList("Sources"),
      },
      apiSourcesCreate: {
        invalidatesTags: invalidatesList("Sources"),
      },
      apiSourcesRetrieve: {
        providesTags: providesOne("Sources"),
      },
      apiSourcesUpdate: {
        invalidatesTags: invalidatesOne("Sources"),
      },
      apiSourcesDestroy: {
        invalidatesTags: invalidatesOne("Sources"),
      },
      /**
       * Resources
       */
      apiResourcesList: {
        providesTags: providesList("Resources"),
      },
      apiResourcesCreate: {
        invalidatesTags: invalidatesList("Resources"),
      },
      /**
       * Attributes
       */
      apiAttributesList: {
        providesTags: providesList("Attributes"),
      },
      /**
       * Owners
       */
      apiOwnersList: {
        providesTags: providesList("Owners"),
      },
      apiOwnersCreate: {
        invalidatesTags: invalidatesList("Owners"),
      },
      apiOwnersDestroy: {
        invalidatesTags: invalidatesOne("Owners"),
      },
      /**
       * Credentials
       */
      apiCredentialsList: {
        providesTags: providesList("Credentials"),
      },
      apiCredentialsCreate: {
        invalidatesTags: invalidatesList("Credentials"),
      },
      apiCredentialsRetrieve: {
        providesTags: providesOne("Credentials"),
      },
      apiCredentialsUpdate: {
        invalidatesTags: invalidatesOne("Credentials"),
      },
      /**
       * Filters
       */
      apiFiltersList: {
        provides: providesList("Filters"),
      },
      apiFiltersCreate: {
        invalidatesTags: invalidatesList("Filters"),
      },
      /**
       * User
       */
      apiUserRetrieve: {
        providesTags: ["User"],
      },
      oidcLogout: {
        invalidatesTags: ["User"],
      },
    },
  });

export const {
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
  // User
  useApiUserRetrieveQuery,
  useOidcLogoutMutation,
} = api;
