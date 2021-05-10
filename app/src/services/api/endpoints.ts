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
        }),
      }),
      apiStructureDefinitionList: build.query<IBundle, { params: string }>({
        query: (queryArg) => ({
          url: `/api/fhir/StructureDefinition?${queryArg.params}`,
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
        }),
      }),
    }),
  })
  .enhanceEndpoints({
    addTagTypes: tagTypes,
    endpoints: {
      oidcLogout: {
        invalidatesTags: ["Users"],
      },
      /**
       * User
       */
      apiUserRetrieve: {
        providesTags: ["Users"],
      },
      /**
       * StructureDefinition
       */
      apiStructureDefinitionList: {
        providesTags: providesFhirBundle("StructureDefinition"),
      },
      apiStructureDefinitionRetrieve: {
        providesTags: providesOne("StructureDefinition"),
      },
      apiStructureDefinitionCreate: {
        invalidatesTags: invalidatesList("StructureDefinition"),
      },
      /**
       * Columns
       */
      apiColumnsCreate: {
        invalidatesTags: invalidatesList("Columns"),
      },
      apiColumnsList: {
        providesTags: providesList("Columns"),
      },
      apiColumnsUpdate: {
        invalidatesTags: invalidatesOne("Columns"),
      },
      apiColumnsDestroy: {
        invalidatesTags: invalidatesOne("Columns"),
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
      apiFiltersUpdate: {
        invalidatesTags: invalidatesOne("Filters"),
      },
      apiFiltersDestroy: {
        invalidatesTags: invalidatesOne("Filters"),
      },
      /**
       * Joins
       */
      apiJoinsCreate: {
        invalidatesTags: invalidatesList("Joins"),
      },
      apiJoinsList: {
        providesTags: providesList("Joins"),
      },
      apiJoinsUpdate: {
        invalidatesTags: invalidatesOne("Joins"),
      },
      apiJoinsDestroy: {
        invalidatesTags: invalidatesOne("Joins"),
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
  useApiColumnsListQuery,
  useApiColumnsUpdateMutation,
  useApiColumnsDestroyMutation,
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
  useApiFiltersUpdateMutation,
  useApiFiltersDestroyMutation,
  // Joins
  useApiJoinsCreateMutation,
  useApiJoinsListQuery,
  useApiJoinsUpdateMutation,
  useApiJoinsDestroyMutation,
} = api;
