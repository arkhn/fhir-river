import {
  IBundle,
  IStructureDefinition,
  IValueSet,
} from "@ahryman40k/ts-fhir-types/lib/R4";
import { Required } from "utility-types";

import {
  providesList,
  providesOne,
  invalidatesList,
  invalidatesOne,
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
  "ValueSets",
  "InputGroups",
  "Inputs",
  "Conditions",
  "Batches",
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
      apiValueSetsRetrieve: build.query<IValueSet | undefined, { id: string }>({
        query: (queryArg) => ({
          url: `/api/fhir/ValueSet/${queryArg.id}/$expand?`,
        }),
      }),
      apiStructureDefinitionList: build.query<
        Required<IStructureDefinition, "id">[],
        { params?: string }
      >({
        query: (queryArg) => ({
          url: `/api/fhir/StructureDefinition?${queryArg.params || ""}`,
        }),
        transformResponse: (response: IBundle) =>
          response.entry?.map(
            ({ resource }) => resource as Required<IStructureDefinition, "id">
          ) || [],
      }),
      apiStructureDefinitionRetrieve: build.query<
        Required<IStructureDefinition, "id">,
        {
          id: string;
          params?: string;
        }
      >({
        query: (queryArg) => ({
          url: `/api/fhir/StructureDefinition/${queryArg.id}?${
            queryArg.params || ""
          }`,
        }),
      }),
      apiStructureDefinitionCreate: build.mutation<
        Required<IStructureDefinition, "id">,
        Required<IStructureDefinition, "id">
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
        providesTags: providesList("StructureDefinition"),
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
      apiColumnsRetrieve: {
        providesTags: providesOne("Columns"),
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
      apiAttributesRetrieve: {
        providesTags: providesOne("Attributes"),
      },
      apiAttributesDestroy: {
        invalidatesTags: invalidatesOne("Attributes"),
      },
      apiAttributesCreate: {
        invalidatesTags: invalidatesList("Attributes"),
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
      /**
       * ValueSets
       */
      apiValueSetsRetrieve: {
        providesTags: providesOne("ValueSets"),
      },
      /**
       * InputGroups
       */
      apiInputGroupsList: {
        providesTags: providesList("InputGroups"),
      },
      apiInputGroupsCreate: {
        invalidatesTags: invalidatesList("InputGroups"),
      },
      apiInputGroupsDestroy: {
        invalidatesTags: invalidatesOne("InputGroups"),
      },
      /**
       * Inputs
       */
      apiInputsList: {
        providesTags: providesList("Inputs"),
      },
      apiInputsCreate: {
        invalidatesTags: invalidatesList("Inputs"),
      },
      apiInputsDestroy: {
        invalidatesTags: invalidatesOne("Inputs"),
      },
      apiInputsUpdate: {
        invalidatesTags: invalidatesOne("Inputs"),
      },
      /**
       * Conditions
       */
      apiConditionsList: {
        providesTags: providesList("Conditions"),
      },
      apiConditionsCreate: {
        invalidatesTags: invalidatesList("Conditions"),
      },
      apiConditionsUpdate: {
        invalidatesTags: invalidatesOne("Conditions"),
      },
      apiConditionsDestroy: {
        invalidatesTags: invalidatesOne("Conditions"),
      },
      /**
       * Batches
       */
      apiBatchesCreate: {
        invalidatesTags: invalidatesList("Batches"),
      },
      apiBatchesList: {
        providesTags: providesList("Batches"),
      },
      apiBatchesDestroy: {
        invalidatesTags: invalidatesOne("Batches"),
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
  useApiColumnsRetrieveQuery,
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
  useApiAttributesRetrieveQuery,
  useApiAttributesDestroyMutation,
  useApiAttributesCreateMutation,
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
  // ValueSets
  useApiValueSetsRetrieveQuery,
  // InputGroups
  useApiInputGroupsListQuery,
  useApiInputGroupsCreateMutation,
  useApiInputGroupsDestroyMutation,
  // Inputs
  useApiInputsListQuery,
  useApiInputsCreateMutation,
  useApiInputsDestroyMutation,
  useApiInputsUpdateMutation,
  // Conditions
  useApiConditionsListQuery,
  useApiConditionsCreateMutation,
  useApiConditionsUpdateMutation,
  useApiConditionsDestroyMutation,
  // Batches
  useApiBatchesCreateMutation,
  useApiBatchesListQuery,
  useApiBatchesDestroyMutation,
} = api;
