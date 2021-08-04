import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../apiBaseQuery";
export const api = createApi({
  baseQuery: apiBaseQuery,
  tagTypes: [],
  endpoints: (build) => ({
    apiAttributesList: build.query<
      ApiAttributesListApiResponse,
      ApiAttributesListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/`,
        params: {
          ordering: queryArg.ordering,
          path: queryArg.path,
          resource: queryArg.resource,
          source: queryArg.source,
        },
      }),
    }),
    apiAttributesCreate: build.mutation<
      ApiAttributesCreateApiResponse,
      ApiAttributesCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/`,
        method: "POST",
        body: queryArg.attributeRequest,
      }),
    }),
    apiAttributesRetrieve: build.query<
      ApiAttributesRetrieveApiResponse,
      ApiAttributesRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/attributes/${queryArg.id}/` }),
    }),
    apiAttributesUpdate: build.mutation<
      ApiAttributesUpdateApiResponse,
      ApiAttributesUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.attributeRequest,
      }),
    }),
    apiAttributesPartialUpdate: build.mutation<
      ApiAttributesPartialUpdateApiResponse,
      ApiAttributesPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedAttributeRequest,
      }),
    }),
    apiAttributesDestroy: build.mutation<
      ApiAttributesDestroyApiResponse,
      ApiAttributesDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiBatchesList: build.query<
      ApiBatchesListApiResponse,
      ApiBatchesListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/batches/`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          ordering: queryArg.ordering,
        },
      }),
    }),
    apiBatchesCreate: build.mutation<
      ApiBatchesCreateApiResponse,
      ApiBatchesCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/batches/`,
        method: "POST",
        body: queryArg.batchRequest,
      }),
    }),
    apiBatchesRetrieve: build.query<
      ApiBatchesRetrieveApiResponse,
      ApiBatchesRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/batches/${queryArg.id}/` }),
    }),
    apiBatchesUpdate: build.mutation<
      ApiBatchesUpdateApiResponse,
      ApiBatchesUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/batches/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.batchRequest,
      }),
    }),
    apiBatchesPartialUpdate: build.mutation<
      ApiBatchesPartialUpdateApiResponse,
      ApiBatchesPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/batches/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedBatchRequest,
      }),
    }),
    apiBatchesDestroy: build.mutation<
      ApiBatchesDestroyApiResponse,
      ApiBatchesDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/batches/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiBatchesRetryCreate: build.mutation<
      ApiBatchesRetryCreateApiResponse,
      ApiBatchesRetryCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/batches/${queryArg.id}/retry/`,
        method: "POST",
        body: queryArg.batchRequest,
      }),
    }),
    apiColumnsList: build.query<
      ApiColumnsListApiResponse,
      ApiColumnsListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/columns/`,
        params: {
          input: queryArg.input,
          join: queryArg.join,
          ordering: queryArg.ordering,
        },
      }),
    }),
    apiColumnsCreate: build.mutation<
      ApiColumnsCreateApiResponse,
      ApiColumnsCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/columns/`,
        method: "POST",
        body: queryArg.columnRequest,
      }),
    }),
    apiColumnsRetrieve: build.query<
      ApiColumnsRetrieveApiResponse,
      ApiColumnsRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/columns/${queryArg.id}/` }),
    }),
    apiColumnsUpdate: build.mutation<
      ApiColumnsUpdateApiResponse,
      ApiColumnsUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/columns/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.columnRequest,
      }),
    }),
    apiColumnsPartialUpdate: build.mutation<
      ApiColumnsPartialUpdateApiResponse,
      ApiColumnsPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/columns/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedColumnRequest,
      }),
    }),
    apiColumnsDestroy: build.mutation<
      ApiColumnsDestroyApiResponse,
      ApiColumnsDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/columns/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiConditionsList: build.query<
      ApiConditionsListApiResponse,
      ApiConditionsListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/conditions/`,
        params: { input_group: queryArg.inputGroup },
      }),
    }),
    apiConditionsCreate: build.mutation<
      ApiConditionsCreateApiResponse,
      ApiConditionsCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/conditions/`,
        method: "POST",
        body: queryArg.conditionRequest,
      }),
    }),
    apiConditionsRetrieve: build.query<
      ApiConditionsRetrieveApiResponse,
      ApiConditionsRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/conditions/${queryArg.id}/` }),
    }),
    apiConditionsUpdate: build.mutation<
      ApiConditionsUpdateApiResponse,
      ApiConditionsUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/conditions/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.conditionRequest,
      }),
    }),
    apiConditionsPartialUpdate: build.mutation<
      ApiConditionsPartialUpdateApiResponse,
      ApiConditionsPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/conditions/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedConditionRequest,
      }),
    }),
    apiConditionsDestroy: build.mutation<
      ApiConditionsDestroyApiResponse,
      ApiConditionsDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/conditions/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiCoreVersionRetrieve: build.query<
      ApiCoreVersionRetrieveApiResponse,
      ApiCoreVersionRetrieveApiArg
    >({
      query: () => ({ url: `/api/core/version/` }),
    }),
    apiCredentialsList: build.query<
      ApiCredentialsListApiResponse,
      ApiCredentialsListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/`,
        params: { ordering: queryArg.ordering, source: queryArg.source },
      }),
    }),
    apiCredentialsCreate: build.mutation<
      ApiCredentialsCreateApiResponse,
      ApiCredentialsCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/`,
        method: "POST",
        body: queryArg.credentialRequest,
      }),
    }),
    apiCredentialsRetrieve: build.query<
      ApiCredentialsRetrieveApiResponse,
      ApiCredentialsRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/credentials/${queryArg.id}/` }),
    }),
    apiCredentialsUpdate: build.mutation<
      ApiCredentialsUpdateApiResponse,
      ApiCredentialsUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.credentialRequest,
      }),
    }),
    apiCredentialsPartialUpdate: build.mutation<
      ApiCredentialsPartialUpdateApiResponse,
      ApiCredentialsPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedCredentialRequest,
      }),
    }),
    apiCredentialsDestroy: build.mutation<
      ApiCredentialsDestroyApiResponse,
      ApiCredentialsDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiFiltersList: build.query<
      ApiFiltersListApiResponse,
      ApiFiltersListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/filters/`,
        params: { resource: queryArg.resource },
      }),
    }),
    apiFiltersCreate: build.mutation<
      ApiFiltersCreateApiResponse,
      ApiFiltersCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/filters/`,
        method: "POST",
        body: queryArg.filterRequest,
      }),
    }),
    apiFiltersRetrieve: build.query<
      ApiFiltersRetrieveApiResponse,
      ApiFiltersRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/filters/${queryArg.id}/` }),
    }),
    apiFiltersUpdate: build.mutation<
      ApiFiltersUpdateApiResponse,
      ApiFiltersUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/filters/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.filterRequest,
      }),
    }),
    apiFiltersPartialUpdate: build.mutation<
      ApiFiltersPartialUpdateApiResponse,
      ApiFiltersPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/filters/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedFilterRequest,
      }),
    }),
    apiFiltersDestroy: build.mutation<
      ApiFiltersDestroyApiResponse,
      ApiFiltersDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/filters/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiInputGroupsList: build.query<
      ApiInputGroupsListApiResponse,
      ApiInputGroupsListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/input-groups/`,
        params: { attribute: queryArg.attribute, ordering: queryArg.ordering },
      }),
    }),
    apiInputGroupsCreate: build.mutation<
      ApiInputGroupsCreateApiResponse,
      ApiInputGroupsCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/input-groups/`,
        method: "POST",
        body: queryArg.inputGroupRequest,
      }),
    }),
    apiInputGroupsRetrieve: build.query<
      ApiInputGroupsRetrieveApiResponse,
      ApiInputGroupsRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/input-groups/${queryArg.id}/` }),
    }),
    apiInputGroupsUpdate: build.mutation<
      ApiInputGroupsUpdateApiResponse,
      ApiInputGroupsUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/input-groups/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.inputGroupRequest,
      }),
    }),
    apiInputGroupsPartialUpdate: build.mutation<
      ApiInputGroupsPartialUpdateApiResponse,
      ApiInputGroupsPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/input-groups/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedInputGroupRequest,
      }),
    }),
    apiInputGroupsDestroy: build.mutation<
      ApiInputGroupsDestroyApiResponse,
      ApiInputGroupsDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/input-groups/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiInputsList: build.query<ApiInputsListApiResponse, ApiInputsListApiArg>({
      query: (queryArg) => ({
        url: `/api/inputs/`,
        params: {
          input_group: queryArg.inputGroup,
          ordering: queryArg.ordering,
        },
      }),
    }),
    apiInputsCreate: build.mutation<
      ApiInputsCreateApiResponse,
      ApiInputsCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/inputs/`,
        method: "POST",
        body: queryArg.inputRequest,
      }),
    }),
    apiInputsRetrieve: build.query<
      ApiInputsRetrieveApiResponse,
      ApiInputsRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/inputs/${queryArg.id}/` }),
    }),
    apiInputsUpdate: build.mutation<
      ApiInputsUpdateApiResponse,
      ApiInputsUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/inputs/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.inputRequest,
      }),
    }),
    apiInputsPartialUpdate: build.mutation<
      ApiInputsPartialUpdateApiResponse,
      ApiInputsPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/inputs/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedInputRequest,
      }),
    }),
    apiInputsDestroy: build.mutation<
      ApiInputsDestroyApiResponse,
      ApiInputsDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/inputs/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiJoinsList: build.query<ApiJoinsListApiResponse, ApiJoinsListApiArg>({
      query: (queryArg) => ({
        url: `/api/joins/`,
        params: { column: queryArg.column, ordering: queryArg.ordering },
      }),
    }),
    apiJoinsCreate: build.mutation<
      ApiJoinsCreateApiResponse,
      ApiJoinsCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/joins/`,
        method: "POST",
        body: queryArg.joinRequest,
      }),
    }),
    apiJoinsRetrieve: build.query<
      ApiJoinsRetrieveApiResponse,
      ApiJoinsRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/joins/${queryArg.id}/` }),
    }),
    apiJoinsUpdate: build.mutation<
      ApiJoinsUpdateApiResponse,
      ApiJoinsUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/joins/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.joinRequest,
      }),
    }),
    apiJoinsPartialUpdate: build.mutation<
      ApiJoinsPartialUpdateApiResponse,
      ApiJoinsPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/joins/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedJoinRequest,
      }),
    }),
    apiJoinsDestroy: build.mutation<
      ApiJoinsDestroyApiResponse,
      ApiJoinsDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/joins/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiOwnersList: build.query<ApiOwnersListApiResponse, ApiOwnersListApiArg>({
      query: (queryArg) => ({
        url: `/api/owners/`,
        params: { credential: queryArg.credential },
      }),
    }),
    apiOwnersCreate: build.mutation<
      ApiOwnersCreateApiResponse,
      ApiOwnersCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/owners/`,
        method: "POST",
        body: queryArg.ownerRequest,
      }),
    }),
    apiOwnersRetrieve: build.query<
      ApiOwnersRetrieveApiResponse,
      ApiOwnersRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/owners/${queryArg.id}/` }),
    }),
    apiOwnersUpdate: build.mutation<
      ApiOwnersUpdateApiResponse,
      ApiOwnersUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/owners/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.ownerRequest,
      }),
    }),
    apiOwnersPartialUpdate: build.mutation<
      ApiOwnersPartialUpdateApiResponse,
      ApiOwnersPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/owners/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedOwnerRequest,
      }),
    }),
    apiOwnersDestroy: build.mutation<
      ApiOwnersDestroyApiResponse,
      ApiOwnersDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/owners/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiPreviewCreate: build.mutation<
      ApiPreviewCreateApiResponse,
      ApiPreviewCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/preview/`,
        method: "POST",
        body: queryArg.previewRequestRequest,
      }),
    }),
    apiResourcesList: build.query<
      ApiResourcesListApiResponse,
      ApiResourcesListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/`,
        params: { ordering: queryArg.ordering, source: queryArg.source },
      }),
    }),
    apiResourcesCreate: build.mutation<
      ApiResourcesCreateApiResponse,
      ApiResourcesCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/`,
        method: "POST",
        body: queryArg.resourceRequest,
      }),
    }),
    apiResourcesRetrieve: build.query<
      ApiResourcesRetrieveApiResponse,
      ApiResourcesRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/resources/${queryArg.id}/` }),
    }),
    apiResourcesUpdate: build.mutation<
      ApiResourcesUpdateApiResponse,
      ApiResourcesUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.resourceRequest,
      }),
    }),
    apiResourcesPartialUpdate: build.mutation<
      ApiResourcesPartialUpdateApiResponse,
      ApiResourcesPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedResourceRequest,
      }),
    }),
    apiResourcesDestroy: build.mutation<
      ApiResourcesDestroyApiResponse,
      ApiResourcesDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiScriptsList: build.query<
      ApiScriptsListApiResponse,
      ApiScriptsListApiArg
    >({
      query: () => ({ url: `/api/scripts/` }),
    }),
    apiSourcesList: build.query<
      ApiSourcesListApiResponse,
      ApiSourcesListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/sources/`,
        params: { ordering: queryArg.ordering },
      }),
    }),
    apiSourcesCreate: build.mutation<
      ApiSourcesCreateApiResponse,
      ApiSourcesCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/sources/`,
        method: "POST",
        body: queryArg.sourceRequest,
      }),
    }),
    apiSourcesRetrieve: build.query<
      ApiSourcesRetrieveApiResponse,
      ApiSourcesRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/sources/${queryArg.id}/` }),
    }),
    apiSourcesUpdate: build.mutation<
      ApiSourcesUpdateApiResponse,
      ApiSourcesUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/sources/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.sourceRequest,
      }),
    }),
    apiSourcesPartialUpdate: build.mutation<
      ApiSourcesPartialUpdateApiResponse,
      ApiSourcesPartialUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/sources/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.patchedSourceRequest,
      }),
    }),
    apiSourcesDestroy: build.mutation<
      ApiSourcesDestroyApiResponse,
      ApiSourcesDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/sources/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiSourcesExportRetrieve: build.query<
      ApiSourcesExportRetrieveApiResponse,
      ApiSourcesExportRetrieveApiArg
    >({
      query: (queryArg) => ({ url: `/api/sources/${queryArg.id}/export/` }),
    }),
    apiSourcesImportCreate: build.mutation<
      ApiSourcesImportCreateApiResponse,
      ApiSourcesImportCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/sources/import/`,
        method: "POST",
        body: queryArg.mappingModelRequest,
      }),
    }),
    apiUserRetrieve: build.query<
      ApiUserRetrieveApiResponse,
      ApiUserRetrieveApiArg
    >({
      query: () => ({ url: `/api/user/` }),
    }),
    pagaiExploreCreate: build.mutation<
      PagaiExploreCreateApiResponse,
      PagaiExploreCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/pagai/explore/`,
        method: "POST",
        body: queryArg.explorationRequestRequest,
      }),
    }),
    pagaiListOwnersCreate: build.mutation<
      PagaiListOwnersCreateApiResponse,
      PagaiListOwnersCreateApiArg
    >({
      query: () => ({ url: `/pagai/list-owners/`, method: "POST" }),
    }),
    pagaiOwnerSchemaCreate: build.mutation<
      PagaiOwnerSchemaCreateApiResponse,
      PagaiOwnerSchemaCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/pagai/owner-schema/${queryArg.owner}/`,
        method: "POST",
      }),
    }),
  }),
});
export type ApiAttributesListApiResponse = /** status 200  */ Attribute[];
export type ApiAttributesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string;
  path?: string;
  resource?: string;
  source?: string;
};
export type ApiAttributesCreateApiResponse = /** status 201  */ Attribute;
export type ApiAttributesCreateApiArg = {
  attributeRequest: AttributeRequest;
};
export type ApiAttributesRetrieveApiResponse = /** status 200  */ Attribute;
export type ApiAttributesRetrieveApiArg = {
  /** A unique value identifying this attribute. */
  id: string;
};
export type ApiAttributesUpdateApiResponse = /** status 200  */ Attribute;
export type ApiAttributesUpdateApiArg = {
  /** A unique value identifying this attribute. */
  id: string;
  attributeRequest: AttributeRequest;
};
export type ApiAttributesPartialUpdateApiResponse =
  /** status 200  */ Attribute;
export type ApiAttributesPartialUpdateApiArg = {
  /** A unique value identifying this attribute. */
  id: string;
  patchedAttributeRequest: PatchedAttributeRequest;
};
export type ApiAttributesDestroyApiResponse = unknown;
export type ApiAttributesDestroyApiArg = {
  /** A unique value identifying this attribute. */
  id: string;
};
export type ApiBatchesListApiResponse = /** status 200  */ PaginatedBatchList;
export type ApiBatchesListApiArg = {
  /** Number of results to return per page. */
  limit?: number;
  /** The initial index from which to return the results. */
  offset?: number;
  /** Which field to use when ordering the results. */
  ordering?: string;
};
export type ApiBatchesCreateApiResponse = /** status 201  */ Batch;
export type ApiBatchesCreateApiArg = {
  batchRequest: BatchRequest;
};
export type ApiBatchesRetrieveApiResponse = /** status 200  */ Batch;
export type ApiBatchesRetrieveApiArg = {
  /** A unique value identifying this batch. */
  id: string;
};
export type ApiBatchesUpdateApiResponse = /** status 200  */ Batch;
export type ApiBatchesUpdateApiArg = {
  /** A unique value identifying this batch. */
  id: string;
  batchRequest: BatchRequest;
};
export type ApiBatchesPartialUpdateApiResponse = /** status 200  */ Batch;
export type ApiBatchesPartialUpdateApiArg = {
  /** A unique value identifying this batch. */
  id: string;
  patchedBatchRequest: PatchedBatchRequest;
};
export type ApiBatchesDestroyApiResponse = unknown;
export type ApiBatchesDestroyApiArg = {
  /** A unique value identifying this batch. */
  id: string;
};
export type ApiBatchesRetryCreateApiResponse = /** status 200  */ Batch;
export type ApiBatchesRetryCreateApiArg = {
  /** A unique value identifying this batch. */
  id: string;
  batchRequest: BatchRequest;
};
export type ApiColumnsListApiResponse = /** status 200  */ Column2[];
export type ApiColumnsListApiArg = {
  input?: string;
  join?: string;
  /** Which field to use when ordering the results. */
  ordering?: string;
};
export type ApiColumnsCreateApiResponse = /** status 201  */ Column2;
export type ApiColumnsCreateApiArg = {
  columnRequest: ColumnRequest2;
};
export type ApiColumnsRetrieveApiResponse = /** status 200  */ Column2;
export type ApiColumnsRetrieveApiArg = {
  /** A unique value identifying this column. */
  id: string;
};
export type ApiColumnsUpdateApiResponse = /** status 200  */ Column2;
export type ApiColumnsUpdateApiArg = {
  /** A unique value identifying this column. */
  id: string;
  columnRequest: ColumnRequest2;
};
export type ApiColumnsPartialUpdateApiResponse = /** status 200  */ Column2;
export type ApiColumnsPartialUpdateApiArg = {
  /** A unique value identifying this column. */
  id: string;
  patchedColumnRequest: PatchedColumnRequest;
};
export type ApiColumnsDestroyApiResponse = unknown;
export type ApiColumnsDestroyApiArg = {
  /** A unique value identifying this column. */
  id: string;
};
export type ApiConditionsListApiResponse = /** status 200  */ Condition2[];
export type ApiConditionsListApiArg = {
  inputGroup?: string;
};
export type ApiConditionsCreateApiResponse = /** status 201  */ Condition2;
export type ApiConditionsCreateApiArg = {
  conditionRequest: ConditionRequest2;
};
export type ApiConditionsRetrieveApiResponse = /** status 200  */ Condition2;
export type ApiConditionsRetrieveApiArg = {
  /** A unique value identifying this condition. */
  id: string;
};
export type ApiConditionsUpdateApiResponse = /** status 200  */ Condition2;
export type ApiConditionsUpdateApiArg = {
  /** A unique value identifying this condition. */
  id: string;
  conditionRequest: ConditionRequest2;
};
export type ApiConditionsPartialUpdateApiResponse =
  /** status 200  */ Condition2;
export type ApiConditionsPartialUpdateApiArg = {
  /** A unique value identifying this condition. */
  id: string;
  patchedConditionRequest: PatchedConditionRequest;
};
export type ApiConditionsDestroyApiResponse = unknown;
export type ApiConditionsDestroyApiArg = {
  /** A unique value identifying this condition. */
  id: string;
};
export type ApiCoreVersionRetrieveApiResponse = unknown;
export type ApiCoreVersionRetrieveApiArg = {};
export type ApiCredentialsListApiResponse = /** status 200  */ Credential2[];
export type ApiCredentialsListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string;
  source?: string;
};
export type ApiCredentialsCreateApiResponse = /** status 201  */ Credential2;
export type ApiCredentialsCreateApiArg = {
  credentialRequest: CredentialRequest2;
};
export type ApiCredentialsRetrieveApiResponse = /** status 200  */ Credential2;
export type ApiCredentialsRetrieveApiArg = {
  /** A unique value identifying this credential. */
  id: string;
};
export type ApiCredentialsUpdateApiResponse = /** status 200  */ Credential2;
export type ApiCredentialsUpdateApiArg = {
  /** A unique value identifying this credential. */
  id: string;
  credentialRequest: CredentialRequest2;
};
export type ApiCredentialsPartialUpdateApiResponse =
  /** status 200  */ Credential2;
export type ApiCredentialsPartialUpdateApiArg = {
  /** A unique value identifying this credential. */
  id: string;
  patchedCredentialRequest: PatchedCredentialRequest;
};
export type ApiCredentialsDestroyApiResponse = unknown;
export type ApiCredentialsDestroyApiArg = {
  /** A unique value identifying this credential. */
  id: string;
};
export type ApiFiltersListApiResponse = /** status 200  */ Filter2[];
export type ApiFiltersListApiArg = {
  resource?: string;
};
export type ApiFiltersCreateApiResponse = /** status 201  */ Filter2;
export type ApiFiltersCreateApiArg = {
  filterRequest: FilterRequest2;
};
export type ApiFiltersRetrieveApiResponse = /** status 200  */ Filter2;
export type ApiFiltersRetrieveApiArg = {
  /** A unique value identifying this filter. */
  id: string;
};
export type ApiFiltersUpdateApiResponse = /** status 200  */ Filter2;
export type ApiFiltersUpdateApiArg = {
  /** A unique value identifying this filter. */
  id: string;
  filterRequest: FilterRequest2;
};
export type ApiFiltersPartialUpdateApiResponse = /** status 200  */ Filter2;
export type ApiFiltersPartialUpdateApiArg = {
  /** A unique value identifying this filter. */
  id: string;
  patchedFilterRequest: PatchedFilterRequest;
};
export type ApiFiltersDestroyApiResponse = unknown;
export type ApiFiltersDestroyApiArg = {
  /** A unique value identifying this filter. */
  id: string;
};
export type ApiInputGroupsListApiResponse = /** status 200  */ InputGroup2[];
export type ApiInputGroupsListApiArg = {
  attribute?: string;
  /** Which field to use when ordering the results. */
  ordering?: string;
};
export type ApiInputGroupsCreateApiResponse = /** status 201  */ InputGroup2;
export type ApiInputGroupsCreateApiArg = {
  inputGroupRequest: InputGroupRequest2;
};
export type ApiInputGroupsRetrieveApiResponse = /** status 200  */ InputGroup2;
export type ApiInputGroupsRetrieveApiArg = {
  /** A unique value identifying this input group. */
  id: string;
};
export type ApiInputGroupsUpdateApiResponse = /** status 200  */ InputGroup2;
export type ApiInputGroupsUpdateApiArg = {
  /** A unique value identifying this input group. */
  id: string;
  inputGroupRequest: InputGroupRequest2;
};
export type ApiInputGroupsPartialUpdateApiResponse =
  /** status 200  */ InputGroup2;
export type ApiInputGroupsPartialUpdateApiArg = {
  /** A unique value identifying this input group. */
  id: string;
  patchedInputGroupRequest: PatchedInputGroupRequest;
};
export type ApiInputGroupsDestroyApiResponse = unknown;
export type ApiInputGroupsDestroyApiArg = {
  /** A unique value identifying this input group. */
  id: string;
};
export type ApiInputsListApiResponse = /** status 200  */ Input2[];
export type ApiInputsListApiArg = {
  inputGroup?: string;
  /** Which field to use when ordering the results. */
  ordering?: string;
};
export type ApiInputsCreateApiResponse = /** status 201  */ Input2;
export type ApiInputsCreateApiArg = {
  inputRequest: InputRequest2;
};
export type ApiInputsRetrieveApiResponse = /** status 200  */ Input2;
export type ApiInputsRetrieveApiArg = {
  /** A unique value identifying this input. */
  id: string;
};
export type ApiInputsUpdateApiResponse = /** status 200  */ Input2;
export type ApiInputsUpdateApiArg = {
  /** A unique value identifying this input. */
  id: string;
  inputRequest: InputRequest2;
};
export type ApiInputsPartialUpdateApiResponse = /** status 200  */ Input2;
export type ApiInputsPartialUpdateApiArg = {
  /** A unique value identifying this input. */
  id: string;
  patchedInputRequest: PatchedInputRequest;
};
export type ApiInputsDestroyApiResponse = unknown;
export type ApiInputsDestroyApiArg = {
  /** A unique value identifying this input. */
  id: string;
};
export type ApiJoinsListApiResponse = /** status 200  */ Join2[];
export type ApiJoinsListApiArg = {
  column?: string;
  /** Which field to use when ordering the results. */
  ordering?: string;
};
export type ApiJoinsCreateApiResponse = /** status 201  */ Join2;
export type ApiJoinsCreateApiArg = {
  joinRequest: JoinRequest2;
};
export type ApiJoinsRetrieveApiResponse = /** status 200  */ Join2;
export type ApiJoinsRetrieveApiArg = {
  /** A unique value identifying this join. */
  id: string;
};
export type ApiJoinsUpdateApiResponse = /** status 200  */ Join2;
export type ApiJoinsUpdateApiArg = {
  /** A unique value identifying this join. */
  id: string;
  joinRequest: JoinRequest2;
};
export type ApiJoinsPartialUpdateApiResponse = /** status 200  */ Join2;
export type ApiJoinsPartialUpdateApiArg = {
  /** A unique value identifying this join. */
  id: string;
  patchedJoinRequest: PatchedJoinRequest;
};
export type ApiJoinsDestroyApiResponse = unknown;
export type ApiJoinsDestroyApiArg = {
  /** A unique value identifying this join. */
  id: string;
};
export type ApiOwnersListApiResponse = /** status 200  */ Owner2[];
export type ApiOwnersListApiArg = {
  credential?: string;
};
export type ApiOwnersCreateApiResponse = /** status 201  */ Owner2;
export type ApiOwnersCreateApiArg = {
  ownerRequest: OwnerRequest2;
};
export type ApiOwnersRetrieveApiResponse = /** status 200  */ Owner2;
export type ApiOwnersRetrieveApiArg = {
  /** A unique value identifying this owner. */
  id: string;
};
export type ApiOwnersUpdateApiResponse = /** status 200  */ Owner2;
export type ApiOwnersUpdateApiArg = {
  /** A unique value identifying this owner. */
  id: string;
  ownerRequest: OwnerRequest2;
};
export type ApiOwnersPartialUpdateApiResponse = /** status 200  */ Owner2;
export type ApiOwnersPartialUpdateApiArg = {
  /** A unique value identifying this owner. */
  id: string;
  patchedOwnerRequest: PatchedOwnerRequest;
};
export type ApiOwnersDestroyApiResponse = unknown;
export type ApiOwnersDestroyApiArg = {
  /** A unique value identifying this owner. */
  id: string;
};
export type ApiPreviewCreateApiResponse = /** status 201  */ PreviewResponse;
export type ApiPreviewCreateApiArg = {
  previewRequestRequest: PreviewRequestRequest;
};
export type ApiResourcesListApiResponse = /** status 200  */ Resource2[];
export type ApiResourcesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string;
  source?: string;
};
export type ApiResourcesCreateApiResponse = /** status 201  */ Resource2;
export type ApiResourcesCreateApiArg = {
  resourceRequest: ResourceRequest2;
};
export type ApiResourcesRetrieveApiResponse = /** status 200  */ Resource2;
export type ApiResourcesRetrieveApiArg = {
  /** A unique value identifying this resource. */
  id: string;
};
export type ApiResourcesUpdateApiResponse = /** status 200  */ Resource2;
export type ApiResourcesUpdateApiArg = {
  /** A unique value identifying this resource. */
  id: string;
  resourceRequest: ResourceRequest2;
};
export type ApiResourcesPartialUpdateApiResponse = /** status 200  */ Resource2;
export type ApiResourcesPartialUpdateApiArg = {
  /** A unique value identifying this resource. */
  id: string;
  patchedResourceRequest: PatchedResourceRequest;
};
export type ApiResourcesDestroyApiResponse = unknown;
export type ApiResourcesDestroyApiArg = {
  /** A unique value identifying this resource. */
  id: string;
};
export type ApiScriptsListApiResponse = /** status 200  */ Scripts[];
export type ApiScriptsListApiArg = {};
export type ApiSourcesListApiResponse = /** status 200  */ Source[];
export type ApiSourcesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string;
};
export type ApiSourcesCreateApiResponse = /** status 201  */ Source;
export type ApiSourcesCreateApiArg = {
  sourceRequest: SourceRequest;
};
export type ApiSourcesRetrieveApiResponse = /** status 200  */ Source;
export type ApiSourcesRetrieveApiArg = {
  /** A unique value identifying this source. */
  id: string;
};
export type ApiSourcesUpdateApiResponse = /** status 200  */ Source;
export type ApiSourcesUpdateApiArg = {
  /** A unique value identifying this source. */
  id: string;
  sourceRequest: SourceRequest;
};
export type ApiSourcesPartialUpdateApiResponse = /** status 200  */ Source;
export type ApiSourcesPartialUpdateApiArg = {
  /** A unique value identifying this source. */
  id: string;
  patchedSourceRequest: PatchedSourceRequest;
};
export type ApiSourcesDestroyApiResponse = unknown;
export type ApiSourcesDestroyApiArg = {
  /** A unique value identifying this source. */
  id: string;
};
export type ApiSourcesExportRetrieveApiResponse =
  /** status 200  */ MappingWithPartialCredentialModel;
export type ApiSourcesExportRetrieveApiArg = {
  /** A unique value identifying this source. */
  id: string;
};
export type ApiSourcesImportCreateApiResponse = /** status 200  */ MappingModel;
export type ApiSourcesImportCreateApiArg = {
  mappingModelRequest: MappingModelRequest;
};
export type ApiUserRetrieveApiResponse = /** status 200  */ User2;
export type ApiUserRetrieveApiArg = {};
export type PagaiExploreCreateApiResponse =
  /** status 201  */ ExplorationResponse;
export type PagaiExploreCreateApiArg = {
  explorationRequestRequest: ExplorationRequestRequest;
};
export type PagaiListOwnersCreateApiResponse = unknown;
export type PagaiListOwnersCreateApiArg = {};
export type PagaiOwnerSchemaCreateApiResponse = unknown;
export type PagaiOwnerSchemaCreateApiArg = {
  owner: string;
};
export type Attribute = {
  id: string;
  path: string;
  slice_name?: string;
  definition_id: string;
  updated_at: string;
  created_at: string;
  resource: string;
};
export type AttributeRequest = {
  path: string;
  slice_name?: string;
  definition_id: string;
  resource: string;
};
export type PatchedAttributeRequest = {
  path?: string;
  slice_name?: string;
  definition_id?: string;
  resource?: string;
};
export type Error = {
  id: string;
  event: string;
  message: string;
  exception?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  batch: string;
};
export type Input = {
  script?: string;
  concept_map_id?: string;
  concept_map?: {
    [key: string]: any;
  };
  static_value?: string | null;
  column: string | null;
};
export type ActionEnum = "INCLUDE" | "EXCLUDE";
export type ConditionRelationEnum =
  | "EQ"
  | "GT"
  | "GE"
  | "LT"
  | "LE"
  | "NOTNULL"
  | "NULL";
export type Condition = {
  action: ActionEnum;
  column: string;
  value?: string;
  relation?: ConditionRelationEnum;
};
export type InputGroup = {
  id: string;
  merging_script?: string;
  inputs?: Input[];
  conditions?: Condition[];
};
export type Attribute2 = {
  path: string;
  slice_name?: string;
  definition_id: string;
  input_groups?: InputGroup[];
};
export type FilterRelationEnum = "=" | "<>" | "IN" | ">" | ">=" | "<" | "<=";
export type Filter = {
  relation: FilterRelationEnum;
  value?: string;
  sql_column: string;
};
export type Resource = {
  id: string;
  label?: string;
  primary_key_table: string;
  primary_key_column: string;
  definition_id: string;
  primary_key_owner: string;
  attributes?: Attribute2[];
  filters?: Filter[];
  logical_reference: string;
};
export type ModelEnum = "MSSQL" | "POSTGRES" | "ORACLE" | "SQLLITE";
export type Join = {
  columns: string[];
};
export type Column = {
  id: string;
  table: string;
  column: string;
  joins?: Join[];
};
export type Owner = {
  id: string;
  name: string;
  schema?: {
    [key: string]: any;
  } | null;
  columns?: Column[];
};
export type Credential = {
  host: string;
  port: number;
  database: string;
  model: ModelEnum;
  owners?: Owner[];
  login: string;
  password: string;
};
export type User = {
  id: string;
  email: string;
  username: string;
};
export type Mapping = {
  id: string;
  name: string;
  version?: string;
  resources?: Resource[];
  credential: Credential;
  users?: User[];
  updated_at: string;
  created_at: string;
};
export type Batch = {
  id: string;
  errors: Error[];
  mappings: Mapping;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};
export type PaginatedBatchList = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Batch[];
};
export type InputRequest = {
  script?: string;
  concept_map_id?: string;
  concept_map?: {
    [key: string]: any;
  };
  static_value?: string | null;
  column: string | null;
};
export type ConditionRequest = {
  action: ActionEnum;
  column: string;
  value?: string;
  relation?: ConditionRelationEnum;
};
export type InputGroupRequest = {
  id: string;
  merging_script?: string;
  inputs?: InputRequest[];
  conditions?: ConditionRequest[];
};
export type AttributeRequest2 = {
  path: string;
  slice_name?: string;
  definition_id: string;
  input_groups?: InputGroupRequest[];
};
export type FilterRequest = {
  relation: FilterRelationEnum;
  value?: string;
  sql_column: string;
};
export type ResourceRequest = {
  id: string;
  label?: string;
  primary_key_table: string;
  primary_key_column: string;
  definition_id: string;
  primary_key_owner: string;
  attributes?: AttributeRequest2[];
  filters?: FilterRequest[];
  logical_reference: string;
};
export type JoinRequest = {
  columns: string[];
};
export type ColumnRequest = {
  id: string;
  table: string;
  column: string;
  joins?: JoinRequest[];
};
export type OwnerRequest = {
  id: string;
  name: string;
  schema?: {
    [key: string]: any;
  } | null;
  columns?: ColumnRequest[];
};
export type CredentialRequest = {
  host: string;
  port: number;
  database: string;
  model: ModelEnum;
  owners?: OwnerRequest[];
  login: string;
  password: string;
};
export type UserRequest = {
  id: string;
  email: string;
  username: string;
};
export type MappingRequest = {
  id: string;
  name: string;
  version?: string;
  resources?: ResourceRequest[];
  credential: CredentialRequest;
  users?: UserRequest[];
  updated_at: string;
  created_at: string;
};
export type BatchRequest = {
  mappings: MappingRequest;
};
export type PatchedBatchRequest = {
  mappings?: MappingRequest;
};
export type Column2 = {
  id: string;
  table: string;
  column: string;
  updated_at: string;
  created_at: string;
  join?: string | null;
  input?: string | null;
  owner: string;
};
export type ColumnRequest2 = {
  table: string;
  column: string;
  join?: string | null;
  input?: string | null;
  owner: string;
};
export type PatchedColumnRequest = {
  table?: string;
  column?: string;
  join?: string | null;
  input?: string | null;
  owner?: string;
};
export type Condition2 = {
  id: string;
  action: ActionEnum;
  value?: string;
  relation?: ConditionRelationEnum;
  column: string;
  input_group: string;
};
export type ConditionRequest2 = {
  action: ActionEnum;
  value?: string;
  relation?: ConditionRelationEnum;
  column: string;
  input_group: string;
};
export type PatchedConditionRequest = {
  action?: ActionEnum;
  value?: string;
  relation?: ConditionRelationEnum;
  column?: string;
  input_group?: string;
};
export type Credential2 = {
  id: string;
  available_owners: string[];
  host: string;
  port: number;
  database: string;
  login: string;
  password: string;
  model: ModelEnum;
  updated_at: string;
  created_at: string;
  source: string;
};
export type CredentialRequest2 = {
  host: string;
  port: number;
  database: string;
  login: string;
  password: string;
  model: ModelEnum;
  source: string;
};
export type PatchedCredentialRequest = {
  host?: string;
  port?: number;
  database?: string;
  login?: string;
  password?: string;
  model?: ModelEnum;
  source?: string;
};
export type Filter2 = {
  id: string;
  relation: FilterRelationEnum;
  value?: string;
  resource: string;
  sql_column: string;
};
export type FilterRequest2 = {
  relation: FilterRelationEnum;
  value?: string;
  resource: string;
  sql_column: string;
};
export type PatchedFilterRequest = {
  relation?: FilterRelationEnum;
  value?: string;
  resource?: string;
  sql_column?: string;
};
export type InputGroup2 = {
  id: string;
  merging_script?: string;
  updated_at: string;
  created_at: string;
  attribute: string;
};
export type InputGroupRequest2 = {
  merging_script?: string;
  attribute: string;
};
export type PatchedInputGroupRequest = {
  merging_script?: string;
  attribute?: string;
};
export type Input2 = {
  id: string;
  script?: string;
  concept_map_id?: string;
  static_value?: string | null;
  updated_at: string;
  created_at: string;
  input_group: string;
};
export type InputRequest2 = {
  script?: string;
  concept_map_id?: string;
  static_value?: string | null;
  input_group: string;
};
export type PatchedInputRequest = {
  script?: string;
  concept_map_id?: string;
  static_value?: string | null;
  input_group?: string;
};
export type Join2 = {
  id: string;
  updated_at: string;
  created_at: string;
  column: string;
};
export type JoinRequest2 = {
  column: string;
};
export type PatchedJoinRequest = {
  column?: string;
};
export type Owner2 = {
  id: string;
  name: string;
  schema: {
    [key: string]: any;
  };
  credential: string;
};
export type OwnerRequest2 = {
  name: string;
  credential: string;
};
export type PatchedOwnerRequest = {
  name?: string;
  credential?: string;
};
export type PreviewResponse = {
  instances: {
    [key: string]: any;
  }[];
  errors: string[];
};
export type PreviewRequestRequest = {
  mapping: MappingRequest;
  primary_key_values: string[];
};
export type Resource2 = {
  id: string;
  label?: string;
  primary_key_table: string;
  primary_key_column: string;
  definition_id: string;
  logical_reference: string;
  updated_at: string;
  created_at: string;
  source: string;
  primary_key_owner: string;
};
export type ResourceRequest2 = {
  label?: string;
  primary_key_table: string;
  primary_key_column: string;
  definition_id: string;
  source: string;
  primary_key_owner: string;
};
export type PatchedResourceRequest = {
  label?: string;
  primary_key_table?: string;
  primary_key_column?: string;
  definition_id?: string;
  source?: string;
  primary_key_owner?: string;
};
export type Scripts = {
  name: string;
  description: string;
  category: string;
};
export type Source = {
  id: string;
  name: string;
  version?: string;
  updated_at: string;
  created_at: string;
  users: string[];
};
export type SourceRequest = {
  name: string;
  version?: string;
};
export type PatchedSourceRequest = {
  name?: string;
  version?: string;
};
export type InputModel = {
  script?: string;
  concept_map_id?: string;
  static_value?: string | null;
  column: string | null;
};
export type ConditionModel = {
  action: ActionEnum;
  column: string;
  value?: string;
  relation?: ConditionRelationEnum;
};
export type InputGroupModel = {
  id: string;
  merging_script?: string;
  inputs?: InputModel[];
  conditions?: ConditionModel[];
};
export type AttributeModel = {
  path: string;
  slice_name?: string;
  definition_id: string;
  input_groups?: InputGroupModel[];
};
export type FilterModel = {
  relation: FilterRelationEnum;
  value?: string;
  sql_column: string;
};
export type ResourceModel = {
  id: string;
  label?: string;
  primary_key_table: string;
  primary_key_column: string;
  definition_id: string;
  logical_reference: string;
  primary_key_owner: string;
  attributes?: AttributeModel[];
  filters?: FilterModel[];
};
export type JoinModel = {
  columns: string[];
};
export type ColumnModel = {
  id: string;
  table: string;
  column: string;
  joins?: JoinModel[];
};
export type OwnerModel = {
  id: string;
  name: string;
  schema?: {
    [key: string]: any;
  } | null;
  columns?: ColumnModel[];
};
export type PartialCredentialModel = {
  host: string;
  port: number;
  database: string;
  model: ModelEnum;
  owners?: OwnerModel[];
};
export type User2 = {
  id: string;
  email: string;
  username: string;
};
export type MappingWithPartialCredentialModel = {
  id: string;
  resources?: ResourceModel[];
  credential: PartialCredentialModel;
  users?: User2[];
  name: string;
  version?: string;
  updated_at: string;
  created_at: string;
};
export type CredentialModel = {
  host: string;
  port: number;
  database: string;
  model: ModelEnum;
  owners?: OwnerModel[];
  login: string;
  password: string;
};
export type MappingModel = {
  id: string;
  resources?: ResourceModel[];
  credential: CredentialModel;
  users?: User2[];
  name: string;
  version?: string;
  updated_at: string;
  created_at: string;
};
export type InputModelRequest = {
  script?: string;
  concept_map_id?: string;
  static_value?: string | null;
  column: string | null;
};
export type ConditionModelRequest = {
  action: ActionEnum;
  column: string;
  value?: string;
  relation?: ConditionRelationEnum;
};
export type InputGroupModelRequest = {
  id: string;
  merging_script?: string;
  inputs?: InputModelRequest[];
  conditions?: ConditionModelRequest[];
};
export type AttributeModelRequest = {
  path: string;
  slice_name?: string;
  definition_id: string;
  input_groups?: InputGroupModelRequest[];
};
export type FilterModelRequest = {
  relation: FilterRelationEnum;
  value?: string;
  sql_column: string;
};
export type ResourceModelRequest = {
  id: string;
  label?: string;
  primary_key_table: string;
  primary_key_column: string;
  definition_id: string;
  logical_reference: string;
  primary_key_owner: string;
  attributes?: AttributeModelRequest[];
  filters?: FilterModelRequest[];
};
export type JoinModelRequest = {
  columns: string[];
};
export type ColumnModelRequest = {
  id: string;
  table: string;
  column: string;
  joins?: JoinModelRequest[];
};
export type OwnerModelRequest = {
  id: string;
  name: string;
  schema?: {
    [key: string]: any;
  } | null;
  columns?: ColumnModelRequest[];
};
export type CredentialModelRequest = {
  host: string;
  port: number;
  database: string;
  model: ModelEnum;
  owners?: OwnerModelRequest[];
  login: string;
  password: string;
};
export type UserRequest2 = {
  email: string;
  username: string;
};
export type MappingModelRequest = {
  id: string;
  resources?: ResourceModelRequest[];
  credential: CredentialModelRequest;
  users?: UserRequest2[];
  name: string;
  version?: string;
};
export type ExplorationResponse = {
  fields: string[];
  rows: string[][];
};
export type ExplorationRequestRequest = {
  resource_id: string;
  mapping: MappingRequest;
  owner: string;
  table: string;
};
export const {
  useApiAttributesListQuery,
  useApiAttributesCreateMutation,
  useApiAttributesRetrieveQuery,
  useApiAttributesUpdateMutation,
  useApiAttributesPartialUpdateMutation,
  useApiAttributesDestroyMutation,
  useApiBatchesListQuery,
  useApiBatchesCreateMutation,
  useApiBatchesRetrieveQuery,
  useApiBatchesUpdateMutation,
  useApiBatchesPartialUpdateMutation,
  useApiBatchesDestroyMutation,
  useApiBatchesRetryCreateMutation,
  useApiColumnsListQuery,
  useApiColumnsCreateMutation,
  useApiColumnsRetrieveQuery,
  useApiColumnsUpdateMutation,
  useApiColumnsPartialUpdateMutation,
  useApiColumnsDestroyMutation,
  useApiConditionsListQuery,
  useApiConditionsCreateMutation,
  useApiConditionsRetrieveQuery,
  useApiConditionsUpdateMutation,
  useApiConditionsPartialUpdateMutation,
  useApiConditionsDestroyMutation,
  useApiCoreVersionRetrieveQuery,
  useApiCredentialsListQuery,
  useApiCredentialsCreateMutation,
  useApiCredentialsRetrieveQuery,
  useApiCredentialsUpdateMutation,
  useApiCredentialsPartialUpdateMutation,
  useApiCredentialsDestroyMutation,
  useApiFiltersListQuery,
  useApiFiltersCreateMutation,
  useApiFiltersRetrieveQuery,
  useApiFiltersUpdateMutation,
  useApiFiltersPartialUpdateMutation,
  useApiFiltersDestroyMutation,
  useApiInputGroupsListQuery,
  useApiInputGroupsCreateMutation,
  useApiInputGroupsRetrieveQuery,
  useApiInputGroupsUpdateMutation,
  useApiInputGroupsPartialUpdateMutation,
  useApiInputGroupsDestroyMutation,
  useApiInputsListQuery,
  useApiInputsCreateMutation,
  useApiInputsRetrieveQuery,
  useApiInputsUpdateMutation,
  useApiInputsPartialUpdateMutation,
  useApiInputsDestroyMutation,
  useApiJoinsListQuery,
  useApiJoinsCreateMutation,
  useApiJoinsRetrieveQuery,
  useApiJoinsUpdateMutation,
  useApiJoinsPartialUpdateMutation,
  useApiJoinsDestroyMutation,
  useApiOwnersListQuery,
  useApiOwnersCreateMutation,
  useApiOwnersRetrieveQuery,
  useApiOwnersUpdateMutation,
  useApiOwnersPartialUpdateMutation,
  useApiOwnersDestroyMutation,
  useApiPreviewCreateMutation,
  useApiResourcesListQuery,
  useApiResourcesCreateMutation,
  useApiResourcesRetrieveQuery,
  useApiResourcesUpdateMutation,
  useApiResourcesPartialUpdateMutation,
  useApiResourcesDestroyMutation,
  useApiScriptsListQuery,
  useApiSourcesListQuery,
  useApiSourcesCreateMutation,
  useApiSourcesRetrieveQuery,
  useApiSourcesUpdateMutation,
  useApiSourcesPartialUpdateMutation,
  useApiSourcesDestroyMutation,
  useApiSourcesExportRetrieveQuery,
  useApiSourcesImportCreateMutation,
  useApiUserRetrieveQuery,
  usePagaiExploreCreateMutation,
  usePagaiListOwnersCreateMutation,
  usePagaiOwnerSchemaCreateMutation,
} = api;
