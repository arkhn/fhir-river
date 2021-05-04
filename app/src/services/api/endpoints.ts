import {
  IBundle,
  IStructureDefinition,
} from "@ahryman40k/ts-fhir-types/lib/R4";

import {
  providesList,
  providesOne,
  invalidatesList,
  invalidatesOne,
  providesFhirBundle,
} from "./cache";
import { api as generatedApi } from "./generated/api.generated";

const tagTypes = [
  "Users",
  "Columns",
  "Sources",
  "Resources",
  "Attributes",
  "Owners",
  "Credentials",
  "Filters",
  "Joins",
  "StructureDefinition",
];

export const api = generatedApi
  .injectEndpoints({
    endpoints: (build) => ({
      oidcLogout: build.mutation({
        query: () => ({
          url: `/oidc/logout/`,
          method: "POST",
          invalidatesTags: ["Users"],
        }),
      }),
      apiStructureDefinitionList: build.query<IBundle, { params: string }>({
        query: (queryArg) => ({
          url: `/api/fhir/StructureDefinition?${queryArg.params}`,
          providesTags: providesFhirBundle("StructureDefinition"),
        }),
      }),
      apiStructureDefinitionRetrieve: build.query<
        IStructureDefinition,
        {
          id: string;
          params: string;
        }
      >({
        query: (queryArg) => ({
          url: `/api/fhir/StructureDefinition/${queryArg.id}?${queryArg.params}`,
          providesTags: providesOne("StructureDefinition"),
        }),
      }),
      apiStructureDefinitionCreate: build.mutation<
        IStructureDefinition,
        IStructureDefinition
      >({
        query: (queryArg) => ({
          url: `/api/fhir/StructureDefinition`,
          method: "POST",
          body: queryArg,
          invalidatesTags: invalidatesList("StructureDefinition"),
        }),
      }),
    }),
  })
  .enhanceEndpoints({
    addTagTypes: tagTypes,
    endpoints: {
      /**
       * User
       */
      apiUserRetrieve: {
        providesTags: ["Users"],
      },
      /**
       * Columns
       */
      apiColumnsCreate: {
        invalidatesTags: invalidatesList("Columns"),
      },
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
      apiResourcesRetrieve: {
        providesTags: providesOne("Resources"),
      },
      apiResourcesCreate: {
        invalidatesTags: invalidatesList("Resources"),
      },
      apiResourcesUpdate: {
        invalidatesTags: invalidatesOne("Resources"),
      },
      apiResourcesDestroy: {
        invalidatesTags: invalidatesOne("Resources"),
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
      apiCredentialsUpdate: {
        invalidatesTags: invalidatesOne("Credentials"),
      },
      /**
       * Filters
       */
      apiFiltersList: {
        providesTags: providesList("Filters"),
      },
      apiFiltersCreate: {
        invalidatesTags: invalidatesList("Filters"),
      },
      /**
       * Joins
       */
      apiJoinsCreate: {
        invalidatesTags: invalidatesList("Joins"),
      },
    },
  });

export const {
  // User
  useApiUserRetrieveQuery,
  useOidcLogoutMutation,
  // StructureDefinition
  useApiStructureDefinitionListQuery,
  useApiStructureDefinitionCreateMutation,
  useApiStructureDefinitionRetrieveQuery,
  //Columns
  useApiColumnsCreateMutation,
  // Sources
  useApiSourcesListQuery,
  useApiSourcesCreateMutation,
  useApiSourcesRetrieveQuery,
  useApiSourcesUpdateMutation,
  useApiSourcesDestroyMutation,
  // Resources
  useApiResourcesListQuery,
  useApiResourcesCreateMutation,
  useApiResourcesRetrieveQuery,
  useApiResourcesUpdateMutation,
  useApiResourcesDestroyMutation,
  // Attributes
  useApiAttributesListQuery,
  // Owners
  useApiOwnersListQuery,
  useApiOwnersCreateMutation,
  useApiOwnersDestroyMutation,
  // Credentials
  useApiCredentialsListQuery,
  useApiCredentialsCreateMutation,
  useApiCredentialsUpdateMutation,
  // Filters
  useApiFiltersListQuery,
  useApiFiltersCreateMutation,
  // Joins
  useApiJoinsCreateMutation,
} = api;
