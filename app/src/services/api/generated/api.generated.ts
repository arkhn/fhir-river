import { createApi } from "@rtk-incubator/rtk-query";
import { apiBaseQuery } from "../apiBaseQuery";
export const api = createApi({
  baseQuery: apiBaseQuery,
  entityTypes: [],
  endpoints: (build) => ({
    apiAttributesList: build.query<
      ApiAttributesListApiResponse,
      ApiAttributesListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/`,
        params: { source: queryArg.source },
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
    apiColumnsList: build.query<
      ApiColumnsListApiResponse,
      ApiColumnsListApiArg
    >({
      query: () => ({ url: `/api/columns/` }),
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
      query: () => ({ url: `/api/conditions/` }),
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
    apiCredentialsList: build.query<
      ApiCredentialsListApiResponse,
      ApiCredentialsListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/`,
        params: { source: queryArg.source },
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
      query: () => ({ url: `/api/filters/` }),
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
      query: () => ({ url: `/api/input-groups/` }),
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
      query: () => ({ url: `/api/inputs/` }),
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
      query: () => ({ url: `/api/joins/` }),
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
    apiOwnersDestroy: build.mutation<
      ApiOwnersDestroyApiResponse,
      ApiOwnersDestroyApiArg
    >({
      query: (queryArg) => ({
        url: `/api/owners/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    apiResourcesList: build.query<
      ApiResourcesListApiResponse,
      ApiResourcesListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/`,
        params: { source: queryArg.source },
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
    apiSourcesList: build.query<
      ApiSourcesListApiResponse,
      ApiSourcesListApiArg
    >({
      query: () => ({ url: `/api/sources/` }),
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
  }),
});
export type ApiAttributesListApiResponse = /** status 200  */ Attribute[];
export type ApiAttributesListApiArg = {
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
export type ApiAttributesPartialUpdateApiResponse = /** status 200  */ Attribute;
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
export type ApiColumnsListApiResponse = /** status 200  */ Column[];
export type ApiColumnsListApiArg = {};
export type ApiColumnsCreateApiResponse = /** status 201  */ Column;
export type ApiColumnsCreateApiArg = {
  columnRequest: ColumnRequest;
};
export type ApiColumnsRetrieveApiResponse = /** status 200  */ Column;
export type ApiColumnsRetrieveApiArg = {
  /** A unique value identifying this column. */
  id: string;
};
export type ApiColumnsUpdateApiResponse = /** status 200  */ Column;
export type ApiColumnsUpdateApiArg = {
  /** A unique value identifying this column. */
  id: string;
  columnRequest: ColumnRequest;
};
export type ApiColumnsPartialUpdateApiResponse = /** status 200  */ Column;
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
export type ApiConditionsListApiResponse = /** status 200  */ Condition[];
export type ApiConditionsListApiArg = {};
export type ApiConditionsCreateApiResponse = /** status 201  */ Condition;
export type ApiConditionsCreateApiArg = {
  conditionRequest: ConditionRequest;
};
export type ApiConditionsRetrieveApiResponse = /** status 200  */ Condition;
export type ApiConditionsRetrieveApiArg = {
  /** A unique value identifying this condition. */
  id: string;
};
export type ApiConditionsUpdateApiResponse = /** status 200  */ Condition;
export type ApiConditionsUpdateApiArg = {
  /** A unique value identifying this condition. */
  id: string;
  conditionRequest: ConditionRequest;
};
export type ApiConditionsPartialUpdateApiResponse = /** status 200  */ Condition;
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
export type ApiCredentialsListApiResponse = /** status 200  */ Credential[];
export type ApiCredentialsListApiArg = {
  source?: string;
};
export type ApiCredentialsCreateApiResponse = /** status 201  */ Credential;
export type ApiCredentialsCreateApiArg = {
  credentialRequest: CredentialRequest;
};
export type ApiCredentialsRetrieveApiResponse = /** status 200  */ Credential;
export type ApiCredentialsRetrieveApiArg = {
  /** A unique value identifying this credential. */
  id: string;
};
export type ApiCredentialsUpdateApiResponse = /** status 200  */ Credential;
export type ApiCredentialsUpdateApiArg = {
  /** A unique value identifying this credential. */
  id: string;
  credentialRequest: CredentialRequest;
};
export type ApiCredentialsPartialUpdateApiResponse = /** status 200  */ Credential;
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
export type ApiFiltersListApiResponse = /** status 200  */ Filter[];
export type ApiFiltersListApiArg = {};
export type ApiFiltersCreateApiResponse = /** status 201  */ Filter;
export type ApiFiltersCreateApiArg = {
  filterRequest: FilterRequest;
};
export type ApiFiltersRetrieveApiResponse = /** status 200  */ Filter;
export type ApiFiltersRetrieveApiArg = {
  /** A unique value identifying this filter. */
  id: string;
};
export type ApiFiltersUpdateApiResponse = /** status 200  */ Filter;
export type ApiFiltersUpdateApiArg = {
  /** A unique value identifying this filter. */
  id: string;
  filterRequest: FilterRequest;
};
export type ApiFiltersPartialUpdateApiResponse = /** status 200  */ Filter;
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
export type ApiInputGroupsListApiResponse = /** status 200  */ InputGroup[];
export type ApiInputGroupsListApiArg = {};
export type ApiInputGroupsCreateApiResponse = /** status 201  */ InputGroup;
export type ApiInputGroupsCreateApiArg = {
  inputGroupRequest: InputGroupRequest;
};
export type ApiInputGroupsRetrieveApiResponse = /** status 200  */ InputGroup;
export type ApiInputGroupsRetrieveApiArg = {
  /** A unique value identifying this input group. */
  id: string;
};
export type ApiInputGroupsUpdateApiResponse = /** status 200  */ InputGroup;
export type ApiInputGroupsUpdateApiArg = {
  /** A unique value identifying this input group. */
  id: string;
  inputGroupRequest: InputGroupRequest;
};
export type ApiInputGroupsPartialUpdateApiResponse = /** status 200  */ InputGroup;
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
export type ApiInputsListApiResponse = /** status 200  */ Input[];
export type ApiInputsListApiArg = {};
export type ApiInputsCreateApiResponse = /** status 201  */ Input;
export type ApiInputsCreateApiArg = {
  inputRequest: InputRequest;
};
export type ApiInputsRetrieveApiResponse = /** status 200  */ Input;
export type ApiInputsRetrieveApiArg = {
  /** A unique value identifying this input. */
  id: string;
};
export type ApiInputsUpdateApiResponse = /** status 200  */ Input;
export type ApiInputsUpdateApiArg = {
  /** A unique value identifying this input. */
  id: string;
  inputRequest: InputRequest;
};
export type ApiInputsPartialUpdateApiResponse = /** status 200  */ Input;
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
export type ApiJoinsListApiResponse = /** status 200  */ Join[];
export type ApiJoinsListApiArg = {};
export type ApiJoinsCreateApiResponse = /** status 201  */ Join;
export type ApiJoinsCreateApiArg = {
  joinRequest: JoinRequest;
};
export type ApiJoinsRetrieveApiResponse = /** status 200  */ Join;
export type ApiJoinsRetrieveApiArg = {
  /** A unique value identifying this join. */
  id: string;
};
export type ApiJoinsUpdateApiResponse = /** status 200  */ Join;
export type ApiJoinsUpdateApiArg = {
  /** A unique value identifying this join. */
  id: string;
  joinRequest: JoinRequest;
};
export type ApiJoinsPartialUpdateApiResponse = /** status 200  */ Join;
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
export type ApiOwnersListApiResponse = /** status 200  */ Owner[];
export type ApiOwnersListApiArg = {
  credential?: string;
};
export type ApiOwnersCreateApiResponse = /** status 201  */ Owner;
export type ApiOwnersCreateApiArg = {
  ownerRequest: OwnerRequest;
};
export type ApiOwnersDestroyApiResponse = unknown;
export type ApiOwnersDestroyApiArg = {
  /** A unique value identifying this owner. */
  id: string;
};
export type ApiResourcesListApiResponse = /** status 200  */ Resource[];
export type ApiResourcesListApiArg = {
  source?: string;
};
export type ApiResourcesCreateApiResponse = /** status 201  */ Resource;
export type ApiResourcesCreateApiArg = {
  resourceRequest: ResourceRequest;
};
export type ApiResourcesRetrieveApiResponse = /** status 200  */ Resource;
export type ApiResourcesRetrieveApiArg = {
  /** A unique value identifying this resource. */
  id: string;
};
export type ApiResourcesUpdateApiResponse = /** status 200  */ Resource;
export type ApiResourcesUpdateApiArg = {
  /** A unique value identifying this resource. */
  id: string;
  resourceRequest: ResourceRequest;
};
export type ApiResourcesPartialUpdateApiResponse = /** status 200  */ Resource;
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
export type ApiSourcesListApiResponse = /** status 200  */ Source[];
export type ApiSourcesListApiArg = {};
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
export type Attribute = {
  id: string;
  path: string;
  sliceName?: string;
  definitionId: string;
  updatedAt: string;
  createdAt: string;
  resource: string;
};
export type AttributeRequest = {
  path: string;
  sliceName?: string;
  definitionId: string;
  resource: string;
};
export type PatchedAttributeRequest = {
  path?: string;
  sliceName?: string;
  definitionId?: string;
  resource?: string;
};
export type Column = {
  id: string;
  table: string;
  column: string;
  updatedAt: string;
  createdAt: string;
  join?: string | null;
  input?: string | null;
  owner: string;
};
export type ColumnRequest = {
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
  id: string;
  action: ActionEnum;
  value?: string;
  relation?: ConditionRelationEnum;
  column: string;
  inputGroup: string;
};
export type ConditionRequest = {
  action: ActionEnum;
  value?: string;
  relation?: ConditionRelationEnum;
  column: string;
  inputGroup: string;
};
export type PatchedConditionRequest = {
  action?: ActionEnum;
  value?: string;
  relation?: ConditionRelationEnum;
  column?: string;
  inputGroup?: string;
};
export type ModelEnum = "MSSQL" | "POSTGRES" | "ORACLE" | "SQLLITE";
export type Credential = {
  id: string;
  owners: string[];
  availableOwners: string[];
  host: string;
  port: number;
  database: string;
  login: string;
  password: string;
  model: ModelEnum;
  updatedAt: string;
  createdAt: string;
  source: string;
};
export type CredentialRequest = {
  owners: string[];
  host: string;
  port: number;
  database: string;
  login: string;
  password: string;
  model: ModelEnum;
  source: string;
};
export type PatchedCredentialRequest = {
  owners?: string[];
  host?: string;
  port?: number;
  database?: string;
  login?: string;
  password?: string;
  model?: ModelEnum;
  source?: string;
};
export type FilterRelationEnum = "=" | "<>" | "IN" | ">" | ">=" | "<" | "<=";
export type Filter = {
  id: string;
  relation: FilterRelationEnum;
  value?: string;
  resource: string;
  sqlColumn: string;
};
export type FilterRequest = {
  relation: FilterRelationEnum;
  value?: string;
  resource: string;
  sqlColumn: string;
};
export type PatchedFilterRequest = {
  relation?: FilterRelationEnum;
  value?: string;
  resource?: string;
  sqlColumn?: string;
};
export type InputGroup = {
  id: string;
  mergingScript?: string;
  updatedAt: string;
  createdAt: string;
  attribute: string;
};
export type InputGroupRequest = {
  mergingScript?: string;
  attribute: string;
};
export type PatchedInputGroupRequest = {
  mergingScript?: string;
  attribute?: string;
};
export type Input = {
  id: string;
  script?: string;
  conceptMapId?: string;
  staticValue?: string;
  updatedAt: string;
  createdAt: string;
  inputGroup: string;
};
export type InputRequest = {
  script?: string;
  conceptMapId?: string;
  staticValue?: string;
  inputGroup: string;
};
export type PatchedInputRequest = {
  script?: string;
  conceptMapId?: string;
  staticValue?: string;
  inputGroup?: string;
};
export type Join = {
  id: string;
  updatedAt: string;
  createdAt: string;
  column: string;
};
export type JoinRequest = {
  column: string;
};
export type PatchedJoinRequest = {
  column?: string;
};
export type Owner = {
  id: string;
  name: string;
  schema: {
    [key: string]: any;
  };
  credential: string;
};
export type OwnerRequest = {
  name: string;
  credential: string;
};
export type Resource = {
  id: string;
  label?: string;
  primaryKeyTable: string;
  primaryKeyColumn: string;
  definitionId: string;
  logicalReference: string;
  updatedAt: string;
  createdAt: string;
  source: string;
  primaryKeyOwner: string;
};
export type ResourceRequest = {
  label?: string;
  primaryKeyTable: string;
  primaryKeyColumn: string;
  definitionId: string;
  logicalReference: string;
  source: string;
  primaryKeyOwner: string;
};
export type PatchedResourceRequest = {
  label?: string;
  primaryKeyTable?: string;
  primaryKeyColumn?: string;
  definitionId?: string;
  logicalReference?: string;
  source?: string;
  primaryKeyOwner?: string;
};
export type Source = {
  id: string;
  name: string;
  version?: string;
  updatedAt: string;
  createdAt: string;
};
export type SourceRequest = {
  name: string;
  version?: string;
};
export type PatchedSourceRequest = {
  name?: string;
  version?: string;
};
export const {
  useApiAttributesListQuery,
  useApiAttributesCreateMutation,
  useApiAttributesRetrieveQuery,
  useApiAttributesUpdateMutation,
  useApiAttributesPartialUpdateMutation,
  useApiAttributesDestroyMutation,
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
  useApiOwnersDestroyMutation,
  useApiResourcesListQuery,
  useApiResourcesCreateMutation,
  useApiResourcesRetrieveQuery,
  useApiResourcesUpdateMutation,
  useApiResourcesPartialUpdateMutation,
  useApiResourcesDestroyMutation,
  useApiSourcesListQuery,
  useApiSourcesCreateMutation,
  useApiSourcesRetrieveQuery,
  useApiSourcesUpdateMutation,
  useApiSourcesPartialUpdateMutation,
  useApiSourcesDestroyMutation,
} = api;
