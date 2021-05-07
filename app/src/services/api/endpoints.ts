import {
  IBundle,
  IStructureDefinition,
  IValueSet,
} from "@ahryman40k/ts-fhir-types/lib/R4";

import {
  providesList,
  providesOne,
  invalidatesList,
  invalidatesOne,
  providesFhirBundle,
} from "./cache";
import { api as generatedApi } from "./generated/api.generated";

type StructureDefinitionWithId = Omit<IStructureDefinition, "id"> & {
  id: string;
};

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
        StructureDefinitionWithId[],
        { id: string; params?: string }
      >({
        query: (queryArg) => ({
          url: `/api/fhir/StructureDefinition?${queryArg.params}`,
          providesTags: providesFhirBundle("StructureDefinition"),
        }),
        transformResponse: (response: IBundle) =>
          response.entry?.map(
            ({ resource }) => resource as StructureDefinitionWithId
          ) || [],
      }),
      apiStructureDefinitionRetrieve: build.query<
        StructureDefinitionWithId,
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
        StructureDefinitionWithId,
        StructureDefinitionWithId
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
      /**
       * ValueSets
       */
      apiValueSetsRetrieve: {
        providesTags: providesOne("ValueSets"),
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
  // ValueSets
  useApiValueSetsRetrieveQuery,
} = api;
