import { createApi } from "@rtk-incubator/rtk-query";
import { apiBaseQuery } from "../apiBaseQuery";
export const api = createApi({
  baseQuery: apiBaseQuery,
  entityTypes: [],
  endpoints: (build) => ({
    listSources: build.query<ListSourcesApiResponse, ListSourcesApiArg>({
      query: () => ({ url: `/api/sources/` }),
    }),
    createSource: build.mutation<CreateSourceApiResponse, CreateSourceApiArg>({
      query: (queryArg) => ({
        url: `/api/sources/`,
        method: "POST",
        body: queryArg.source,
      }),
    }),
    retrieveSource: build.query<
      RetrieveSourceApiResponse,
      RetrieveSourceApiArg
    >({
      query: (queryArg) => ({ url: `/api/sources/${queryArg.id}/` }),
    }),
    updateSource: build.mutation<UpdateSourceApiResponse, UpdateSourceApiArg>({
      query: (queryArg) => ({
        url: `/api/sources/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.source,
      }),
    }),
    partialUpdateSource: build.mutation<
      PartialUpdateSourceApiResponse,
      PartialUpdateSourceApiArg
    >({
      query: (queryArg) => ({
        url: `/api/sources/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.source,
      }),
    }),
    destroySource: build.mutation<
      DestroySourceApiResponse,
      DestroySourceApiArg
    >({
      query: (queryArg) => ({
        url: `/api/sources/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listResources: build.query<ListResourcesApiResponse, ListResourcesApiArg>({
      query: () => ({ url: `/api/resources/` }),
    }),
    createResource: build.mutation<
      CreateResourceApiResponse,
      CreateResourceApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/`,
        method: "POST",
        body: queryArg.resource,
      }),
    }),
    retrieveResource: build.query<
      RetrieveResourceApiResponse,
      RetrieveResourceApiArg
    >({
      query: (queryArg) => ({ url: `/api/resources/${queryArg.id}/` }),
    }),
    updateResource: build.mutation<
      UpdateResourceApiResponse,
      UpdateResourceApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.resource,
      }),
    }),
    partialUpdateResource: build.mutation<
      PartialUpdateResourceApiResponse,
      PartialUpdateResourceApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.resource,
      }),
    }),
    destroyResource: build.mutation<
      DestroyResourceApiResponse,
      DestroyResourceApiArg
    >({
      query: (queryArg) => ({
        url: `/api/resources/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listCredentials: build.query<
      ListCredentialsApiResponse,
      ListCredentialsApiArg
    >({
      query: () => ({ url: `/api/credentials/` }),
    }),
    createCredential: build.mutation<
      CreateCredentialApiResponse,
      CreateCredentialApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/`,
        method: "POST",
        body: queryArg.credential,
      }),
    }),
    retrieveCredential: build.query<
      RetrieveCredentialApiResponse,
      RetrieveCredentialApiArg
    >({
      query: (queryArg) => ({ url: `/api/credentials/${queryArg.id}/` }),
    }),
    updateCredential: build.mutation<
      UpdateCredentialApiResponse,
      UpdateCredentialApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.credential,
      }),
    }),
    partialUpdateCredential: build.mutation<
      PartialUpdateCredentialApiResponse,
      PartialUpdateCredentialApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.credential,
      }),
    }),
    destroyCredential: build.mutation<
      DestroyCredentialApiResponse,
      DestroyCredentialApiArg
    >({
      query: (queryArg) => ({
        url: `/api/credentials/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listAttributes: build.query<
      ListAttributesApiResponse,
      ListAttributesApiArg
    >({
      query: () => ({ url: `/api/attributes/` }),
    }),
    createAttribute: build.mutation<
      CreateAttributeApiResponse,
      CreateAttributeApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/`,
        method: "POST",
        body: queryArg.attribute,
      }),
    }),
    retrieveAttribute: build.query<
      RetrieveAttributeApiResponse,
      RetrieveAttributeApiArg
    >({
      query: (queryArg) => ({ url: `/api/attributes/${queryArg.id}/` }),
    }),
    updateAttribute: build.mutation<
      UpdateAttributeApiResponse,
      UpdateAttributeApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.attribute,
      }),
    }),
    partialUpdateAttribute: build.mutation<
      PartialUpdateAttributeApiResponse,
      PartialUpdateAttributeApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.attribute,
      }),
    }),
    destroyAttribute: build.mutation<
      DestroyAttributeApiResponse,
      DestroyAttributeApiArg
    >({
      query: (queryArg) => ({
        url: `/api/attributes/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listInputGroups: build.query<
      ListInputGroupsApiResponse,
      ListInputGroupsApiArg
    >({
      query: () => ({ url: `/api/input-groups/` }),
    }),
    createInputGroup: build.mutation<
      CreateInputGroupApiResponse,
      CreateInputGroupApiArg
    >({
      query: (queryArg) => ({
        url: `/api/input-groups/`,
        method: "POST",
        body: queryArg.inputGroup,
      }),
    }),
    retrieveInputGroup: build.query<
      RetrieveInputGroupApiResponse,
      RetrieveInputGroupApiArg
    >({
      query: (queryArg) => ({ url: `/api/input-groups/${queryArg.id}/` }),
    }),
    updateInputGroup: build.mutation<
      UpdateInputGroupApiResponse,
      UpdateInputGroupApiArg
    >({
      query: (queryArg) => ({
        url: `/api/input-groups/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.inputGroup,
      }),
    }),
    partialUpdateInputGroup: build.mutation<
      PartialUpdateInputGroupApiResponse,
      PartialUpdateInputGroupApiArg
    >({
      query: (queryArg) => ({
        url: `/api/input-groups/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.inputGroup,
      }),
    }),
    destroyInputGroup: build.mutation<
      DestroyInputGroupApiResponse,
      DestroyInputGroupApiArg
    >({
      query: (queryArg) => ({
        url: `/api/input-groups/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listInputs: build.query<ListInputsApiResponse, ListInputsApiArg>({
      query: () => ({ url: `/api/inputs/` }),
    }),
    createInput: build.mutation<CreateInputApiResponse, CreateInputApiArg>({
      query: (queryArg) => ({
        url: `/api/inputs/`,
        method: "POST",
        body: queryArg.input,
      }),
    }),
    retrieveInput: build.query<RetrieveInputApiResponse, RetrieveInputApiArg>({
      query: (queryArg) => ({ url: `/api/inputs/${queryArg.id}/` }),
    }),
    updateInput: build.mutation<UpdateInputApiResponse, UpdateInputApiArg>({
      query: (queryArg) => ({
        url: `/api/inputs/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.input,
      }),
    }),
    partialUpdateInput: build.mutation<
      PartialUpdateInputApiResponse,
      PartialUpdateInputApiArg
    >({
      query: (queryArg) => ({
        url: `/api/inputs/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.input,
      }),
    }),
    destroyInput: build.mutation<DestroyInputApiResponse, DestroyInputApiArg>({
      query: (queryArg) => ({
        url: `/api/inputs/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listColumns: build.query<ListColumnsApiResponse, ListColumnsApiArg>({
      query: () => ({ url: `/api/columns/` }),
    }),
    createColumn: build.mutation<CreateColumnApiResponse, CreateColumnApiArg>({
      query: (queryArg) => ({
        url: `/api/columns/`,
        method: "POST",
        body: queryArg.column,
      }),
    }),
    retrieveColumn: build.query<
      RetrieveColumnApiResponse,
      RetrieveColumnApiArg
    >({
      query: (queryArg) => ({ url: `/api/columns/${queryArg.id}/` }),
    }),
    updateColumn: build.mutation<UpdateColumnApiResponse, UpdateColumnApiArg>({
      query: (queryArg) => ({
        url: `/api/columns/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.column,
      }),
    }),
    partialUpdateColumn: build.mutation<
      PartialUpdateColumnApiResponse,
      PartialUpdateColumnApiArg
    >({
      query: (queryArg) => ({
        url: `/api/columns/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.column,
      }),
    }),
    destroyColumn: build.mutation<
      DestroyColumnApiResponse,
      DestroyColumnApiArg
    >({
      query: (queryArg) => ({
        url: `/api/columns/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listJoins: build.query<ListJoinsApiResponse, ListJoinsApiArg>({
      query: () => ({ url: `/api/joins/` }),
    }),
    createJoin: build.mutation<CreateJoinApiResponse, CreateJoinApiArg>({
      query: (queryArg) => ({
        url: `/api/joins/`,
        method: "POST",
        body: queryArg.join,
      }),
    }),
    retrieveJoin: build.query<RetrieveJoinApiResponse, RetrieveJoinApiArg>({
      query: (queryArg) => ({ url: `/api/joins/${queryArg.id}/` }),
    }),
    updateJoin: build.mutation<UpdateJoinApiResponse, UpdateJoinApiArg>({
      query: (queryArg) => ({
        url: `/api/joins/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.join,
      }),
    }),
    partialUpdateJoin: build.mutation<
      PartialUpdateJoinApiResponse,
      PartialUpdateJoinApiArg
    >({
      query: (queryArg) => ({
        url: `/api/joins/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.join,
      }),
    }),
    destroyJoin: build.mutation<DestroyJoinApiResponse, DestroyJoinApiArg>({
      query: (queryArg) => ({
        url: `/api/joins/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listConditions: build.query<
      ListConditionsApiResponse,
      ListConditionsApiArg
    >({
      query: () => ({ url: `/api/conditions/` }),
    }),
    createCondition: build.mutation<
      CreateConditionApiResponse,
      CreateConditionApiArg
    >({
      query: (queryArg) => ({
        url: `/api/conditions/`,
        method: "POST",
        body: queryArg.condition,
      }),
    }),
    retrieveCondition: build.query<
      RetrieveConditionApiResponse,
      RetrieveConditionApiArg
    >({
      query: (queryArg) => ({ url: `/api/conditions/${queryArg.id}/` }),
    }),
    updateCondition: build.mutation<
      UpdateConditionApiResponse,
      UpdateConditionApiArg
    >({
      query: (queryArg) => ({
        url: `/api/conditions/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.condition,
      }),
    }),
    partialUpdateCondition: build.mutation<
      PartialUpdateConditionApiResponse,
      PartialUpdateConditionApiArg
    >({
      query: (queryArg) => ({
        url: `/api/conditions/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.condition,
      }),
    }),
    destroyCondition: build.mutation<
      DestroyConditionApiResponse,
      DestroyConditionApiArg
    >({
      query: (queryArg) => ({
        url: `/api/conditions/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listFilters: build.query<ListFiltersApiResponse, ListFiltersApiArg>({
      query: () => ({ url: `/api/filters/` }),
    }),
    createFilter: build.mutation<CreateFilterApiResponse, CreateFilterApiArg>({
      query: (queryArg) => ({
        url: `/api/filters/`,
        method: "POST",
        body: queryArg.filter,
      }),
    }),
    retrieveFilter: build.query<
      RetrieveFilterApiResponse,
      RetrieveFilterApiArg
    >({
      query: (queryArg) => ({ url: `/api/filters/${queryArg.id}/` }),
    }),
    updateFilter: build.mutation<UpdateFilterApiResponse, UpdateFilterApiArg>({
      query: (queryArg) => ({
        url: `/api/filters/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.filter,
      }),
    }),
    partialUpdateFilter: build.mutation<
      PartialUpdateFilterApiResponse,
      PartialUpdateFilterApiArg
    >({
      query: (queryArg) => ({
        url: `/api/filters/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.filter,
      }),
    }),
    destroyFilter: build.mutation<
      DestroyFilterApiResponse,
      DestroyFilterApiArg
    >({
      query: (queryArg) => ({
        url: `/api/filters/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
    listOwners: build.query<ListOwnersApiResponse, ListOwnersApiArg>({
      query: () => ({ url: `/api/owners/` }),
    }),
    createOwner: build.mutation<CreateOwnerApiResponse, CreateOwnerApiArg>({
      query: (queryArg) => ({
        url: `/api/owners/`,
        method: "POST",
        body: queryArg.owner,
      }),
    }),
    retrieveOwner: build.query<RetrieveOwnerApiResponse, RetrieveOwnerApiArg>({
      query: (queryArg) => ({ url: `/api/owners/${queryArg.id}/` }),
    }),
    updateOwner: build.mutation<UpdateOwnerApiResponse, UpdateOwnerApiArg>({
      query: (queryArg) => ({
        url: `/api/owners/${queryArg.id}/`,
        method: "PUT",
        body: queryArg.owner,
      }),
    }),
    partialUpdateOwner: build.mutation<
      PartialUpdateOwnerApiResponse,
      PartialUpdateOwnerApiArg
    >({
      query: (queryArg) => ({
        url: `/api/owners/${queryArg.id}/`,
        method: "PATCH",
        body: queryArg.owner,
      }),
    }),
    destroyOwner: build.mutation<DestroyOwnerApiResponse, DestroyOwnerApiArg>({
      query: (queryArg) => ({
        url: `/api/owners/${queryArg.id}/`,
        method: "DELETE",
      }),
    }),
  }),
});
export type ListSourcesApiResponse = /** status 200  */ Source[];
export type ListSourcesApiArg = {};
export type CreateSourceApiResponse = /** status 201  */ Source;
export type CreateSourceApiArg = {
  source: Source;
};
export type RetrieveSourceApiResponse = /** status 200  */ Source;
export type RetrieveSourceApiArg = {
  /** A unique value identifying this source. */
  id: string;
};
export type UpdateSourceApiResponse = /** status 200  */ Source;
export type UpdateSourceApiArg = {
  /** A unique value identifying this source. */
  id: string;
  source: Source;
};
export type PartialUpdateSourceApiResponse = /** status 200  */ Source;
export type PartialUpdateSourceApiArg = {
  /** A unique value identifying this source. */
  id: string;
  source: Source;
};
export type DestroySourceApiResponse = unknown;
export type DestroySourceApiArg = {
  /** A unique value identifying this source. */
  id: string;
};
export type ListResourcesApiResponse = /** status 200  */ Resource[];
export type ListResourcesApiArg = {};
export type CreateResourceApiResponse = /** status 201  */ Resource;
export type CreateResourceApiArg = {
  resource: Resource;
};
export type RetrieveResourceApiResponse = /** status 200  */ Resource;
export type RetrieveResourceApiArg = {
  /** A unique value identifying this resource. */
  id: string;
};
export type UpdateResourceApiResponse = /** status 200  */ Resource;
export type UpdateResourceApiArg = {
  /** A unique value identifying this resource. */
  id: string;
  resource: Resource;
};
export type PartialUpdateResourceApiResponse = /** status 200  */ Resource;
export type PartialUpdateResourceApiArg = {
  /** A unique value identifying this resource. */
  id: string;
  resource: Resource;
};
export type DestroyResourceApiResponse = unknown;
export type DestroyResourceApiArg = {
  /** A unique value identifying this resource. */
  id: string;
};
export type ListCredentialsApiResponse = /** status 200  */ Credential[];
export type ListCredentialsApiArg = {};
export type CreateCredentialApiResponse = /** status 201  */ Credential;
export type CreateCredentialApiArg = {
  credential: Credential;
};
export type RetrieveCredentialApiResponse = /** status 200  */ Credential;
export type RetrieveCredentialApiArg = {
  /** A unique value identifying this credential. */
  id: string;
};
export type UpdateCredentialApiResponse = /** status 200  */ Credential;
export type UpdateCredentialApiArg = {
  /** A unique value identifying this credential. */
  id: string;
  credential: Credential;
};
export type PartialUpdateCredentialApiResponse = /** status 200  */ Credential;
export type PartialUpdateCredentialApiArg = {
  /** A unique value identifying this credential. */
  id: string;
  credential: Credential;
};
export type DestroyCredentialApiResponse = unknown;
export type DestroyCredentialApiArg = {
  /** A unique value identifying this credential. */
  id: string;
};
export type ListAttributesApiResponse = /** status 200  */ Attribute[];
export type ListAttributesApiArg = {};
export type CreateAttributeApiResponse = /** status 201  */ Attribute;
export type CreateAttributeApiArg = {
  attribute: Attribute;
};
export type RetrieveAttributeApiResponse = /** status 200  */ Attribute;
export type RetrieveAttributeApiArg = {
  /** A unique value identifying this attribute. */
  id: string;
};
export type UpdateAttributeApiResponse = /** status 200  */ Attribute;
export type UpdateAttributeApiArg = {
  /** A unique value identifying this attribute. */
  id: string;
  attribute: Attribute;
};
export type PartialUpdateAttributeApiResponse = /** status 200  */ Attribute;
export type PartialUpdateAttributeApiArg = {
  /** A unique value identifying this attribute. */
  id: string;
  attribute: Attribute;
};
export type DestroyAttributeApiResponse = unknown;
export type DestroyAttributeApiArg = {
  /** A unique value identifying this attribute. */
  id: string;
};
export type ListInputGroupsApiResponse = /** status 200  */ InputGroup[];
export type ListInputGroupsApiArg = {};
export type CreateInputGroupApiResponse = /** status 201  */ InputGroup;
export type CreateInputGroupApiArg = {
  inputGroup: InputGroup;
};
export type RetrieveInputGroupApiResponse = /** status 200  */ InputGroup;
export type RetrieveInputGroupApiArg = {
  /** A unique value identifying this input group. */
  id: string;
};
export type UpdateInputGroupApiResponse = /** status 200  */ InputGroup;
export type UpdateInputGroupApiArg = {
  /** A unique value identifying this input group. */
  id: string;
  inputGroup: InputGroup;
};
export type PartialUpdateInputGroupApiResponse = /** status 200  */ InputGroup;
export type PartialUpdateInputGroupApiArg = {
  /** A unique value identifying this input group. */
  id: string;
  inputGroup: InputGroup;
};
export type DestroyInputGroupApiResponse = unknown;
export type DestroyInputGroupApiArg = {
  /** A unique value identifying this input group. */
  id: string;
};
export type ListInputsApiResponse = /** status 200  */ Input[];
export type ListInputsApiArg = {};
export type CreateInputApiResponse = /** status 201  */ Input;
export type CreateInputApiArg = {
  input: Input;
};
export type RetrieveInputApiResponse = /** status 200  */ Input;
export type RetrieveInputApiArg = {
  /** A unique value identifying this input. */
  id: string;
};
export type UpdateInputApiResponse = /** status 200  */ Input;
export type UpdateInputApiArg = {
  /** A unique value identifying this input. */
  id: string;
  input: Input;
};
export type PartialUpdateInputApiResponse = /** status 200  */ Input;
export type PartialUpdateInputApiArg = {
  /** A unique value identifying this input. */
  id: string;
  input: Input;
};
export type DestroyInputApiResponse = unknown;
export type DestroyInputApiArg = {
  /** A unique value identifying this input. */
  id: string;
};
export type ListColumnsApiResponse = /** status 200  */ Column[];
export type ListColumnsApiArg = {};
export type CreateColumnApiResponse = /** status 201  */ Column;
export type CreateColumnApiArg = {
  column: Column;
};
export type RetrieveColumnApiResponse = /** status 200  */ Column;
export type RetrieveColumnApiArg = {
  /** A unique value identifying this column. */
  id: string;
};
export type UpdateColumnApiResponse = /** status 200  */ Column;
export type UpdateColumnApiArg = {
  /** A unique value identifying this column. */
  id: string;
  column: Column;
};
export type PartialUpdateColumnApiResponse = /** status 200  */ Column;
export type PartialUpdateColumnApiArg = {
  /** A unique value identifying this column. */
  id: string;
  column: Column;
};
export type DestroyColumnApiResponse = unknown;
export type DestroyColumnApiArg = {
  /** A unique value identifying this column. */
  id: string;
};
export type ListJoinsApiResponse = /** status 200  */ Join[];
export type ListJoinsApiArg = {};
export type CreateJoinApiResponse = /** status 201  */ Join;
export type CreateJoinApiArg = {
  join: Join;
};
export type RetrieveJoinApiResponse = /** status 200  */ Join;
export type RetrieveJoinApiArg = {
  /** A unique value identifying this join. */
  id: string;
};
export type UpdateJoinApiResponse = /** status 200  */ Join;
export type UpdateJoinApiArg = {
  /** A unique value identifying this join. */
  id: string;
  join: Join;
};
export type PartialUpdateJoinApiResponse = /** status 200  */ Join;
export type PartialUpdateJoinApiArg = {
  /** A unique value identifying this join. */
  id: string;
  join: Join;
};
export type DestroyJoinApiResponse = unknown;
export type DestroyJoinApiArg = {
  /** A unique value identifying this join. */
  id: string;
};
export type ListConditionsApiResponse = /** status 200  */ Condition[];
export type ListConditionsApiArg = {};
export type CreateConditionApiResponse = /** status 201  */ Condition;
export type CreateConditionApiArg = {
  condition: Condition;
};
export type RetrieveConditionApiResponse = /** status 200  */ Condition;
export type RetrieveConditionApiArg = {
  /** A unique value identifying this condition. */
  id: string;
};
export type UpdateConditionApiResponse = /** status 200  */ Condition;
export type UpdateConditionApiArg = {
  /** A unique value identifying this condition. */
  id: string;
  condition: Condition;
};
export type PartialUpdateConditionApiResponse = /** status 200  */ Condition;
export type PartialUpdateConditionApiArg = {
  /** A unique value identifying this condition. */
  id: string;
  condition: Condition;
};
export type DestroyConditionApiResponse = unknown;
export type DestroyConditionApiArg = {
  /** A unique value identifying this condition. */
  id: string;
};
export type ListFiltersApiResponse = /** status 200  */ Filter[];
export type ListFiltersApiArg = {};
export type CreateFilterApiResponse = /** status 201  */ Filter;
export type CreateFilterApiArg = {
  filter: Filter;
};
export type RetrieveFilterApiResponse = /** status 200  */ Filter;
export type RetrieveFilterApiArg = {
  /** A unique value identifying this filter. */
  id: string;
};
export type UpdateFilterApiResponse = /** status 200  */ Filter;
export type UpdateFilterApiArg = {
  /** A unique value identifying this filter. */
  id: string;
  filter: Filter;
};
export type PartialUpdateFilterApiResponse = /** status 200  */ Filter;
export type PartialUpdateFilterApiArg = {
  /** A unique value identifying this filter. */
  id: string;
  filter: Filter;
};
export type DestroyFilterApiResponse = unknown;
export type DestroyFilterApiArg = {
  /** A unique value identifying this filter. */
  id: string;
};
export type ListOwnersApiResponse = /** status 200  */ Owner[];
export type ListOwnersApiArg = {};
export type CreateOwnerApiResponse = /** status 201  */ Owner;
export type CreateOwnerApiArg = {
  owner: Owner;
};
export type RetrieveOwnerApiResponse = /** status 200  */ Owner;
export type RetrieveOwnerApiArg = {
  /** A unique value identifying this owner. */
  id: string;
};
export type UpdateOwnerApiResponse = /** status 200  */ Owner;
export type UpdateOwnerApiArg = {
  /** A unique value identifying this owner. */
  id: string;
  owner: Owner;
};
export type PartialUpdateOwnerApiResponse = /** status 200  */ Owner;
export type PartialUpdateOwnerApiArg = {
  /** A unique value identifying this owner. */
  id: string;
  owner: Owner;
};
export type DestroyOwnerApiResponse = unknown;
export type DestroyOwnerApiArg = {
  /** A unique value identifying this owner. */
  id: string;
};
export type Source = {
  id?: string;
  resources?: {
    id?: string;
    attributes?: string[];
    label?: string;
    primary_key_table: string;
    primary_key_column: string;
    definition_id: string;
    logical_reference: string;
    updated_at?: string;
    created_at?: string;
    source: string;
    primary_key_owner: string;
  }[];
  name: string;
  version?: string;
  updated_at?: string;
  created_at?: string;
};
export type Resource = {
  id?: string;
  attributes?: string[];
  label?: string;
  primary_key_table: string;
  primary_key_column: string;
  definition_id: string;
  logical_reference: string;
  updated_at?: string;
  created_at?: string;
  source: string;
  primary_key_owner: string;
};
export type Credential = {
  id?: string;
  host: string;
  port: number;
  database: string;
  login: string;
  password: string;
  model: "MSSQL" | "POSTGRES" | "ORACLE" | "SQLLITE";
  updated_at?: string;
  created_at?: string;
  source: string;
};
export type Attribute = {
  id?: string;
  path: string;
  slice_name?: string;
  definition_id: string;
  updated_at?: string;
  created_at?: string;
  resource: string;
};
export type InputGroup = {
  id?: string;
  merging_script?: string;
  updated_at?: string;
  created_at?: string;
  attribute: string;
};
export type Input = {
  id?: string;
  script?: string;
  concept_map_id?: string;
  static_value?: string;
  updated_at?: string;
  created_at?: string;
  input_group: string;
};
export type Column = {
  id?: string;
  table: string;
  column: string;
  updated_at?: string;
  created_at?: string;
  join?: string | null;
  input?: string | null;
  owner: string;
};
export type Join = {
  id?: string;
  updated_at?: string;
  created_at?: string;
  column: string;
};
export type Condition = {
  id?: string;
  action: "INCLUDE" | "EXCLUDE";
  value?: string;
  relation?: "EQ" | "GT" | "GE" | "LT" | "LE" | "NOTNULL" | "NULL";
  column: string;
  input_group: string;
};
export type Filter = {
  id?: string;
  relation: "=" | "<>" | "IN" | ">" | ">=" | "<" | "<=";
  value?: string;
  resource: string;
  sql_column: string;
};
export type Owner = {
  id?: string;
  name: string;
  schema?: object | null;
  credential: string;
};
export const {
  useListSourcesQuery,
  useCreateSourceMutation,
  useRetrieveSourceQuery,
  useUpdateSourceMutation,
  usePartialUpdateSourceMutation,
  useDestroySourceMutation,
  useListResourcesQuery,
  useCreateResourceMutation,
  useRetrieveResourceQuery,
  useUpdateResourceMutation,
  usePartialUpdateResourceMutation,
  useDestroyResourceMutation,
  useListCredentialsQuery,
  useCreateCredentialMutation,
  useRetrieveCredentialQuery,
  useUpdateCredentialMutation,
  usePartialUpdateCredentialMutation,
  useDestroyCredentialMutation,
  useListAttributesQuery,
  useCreateAttributeMutation,
  useRetrieveAttributeQuery,
  useUpdateAttributeMutation,
  usePartialUpdateAttributeMutation,
  useDestroyAttributeMutation,
  useListInputGroupsQuery,
  useCreateInputGroupMutation,
  useRetrieveInputGroupQuery,
  useUpdateInputGroupMutation,
  usePartialUpdateInputGroupMutation,
  useDestroyInputGroupMutation,
  useListInputsQuery,
  useCreateInputMutation,
  useRetrieveInputQuery,
  useUpdateInputMutation,
  usePartialUpdateInputMutation,
  useDestroyInputMutation,
  useListColumnsQuery,
  useCreateColumnMutation,
  useRetrieveColumnQuery,
  useUpdateColumnMutation,
  usePartialUpdateColumnMutation,
  useDestroyColumnMutation,
  useListJoinsQuery,
  useCreateJoinMutation,
  useRetrieveJoinQuery,
  useUpdateJoinMutation,
  usePartialUpdateJoinMutation,
  useDestroyJoinMutation,
  useListConditionsQuery,
  useCreateConditionMutation,
  useRetrieveConditionQuery,
  useUpdateConditionMutation,
  usePartialUpdateConditionMutation,
  useDestroyConditionMutation,
  useListFiltersQuery,
  useCreateFilterMutation,
  useRetrieveFilterQuery,
  useUpdateFilterMutation,
  usePartialUpdateFilterMutation,
  useDestroyFilterMutation,
  useListOwnersQuery,
  useCreateOwnerMutation,
  useRetrieveOwnerQuery,
  useUpdateOwnerMutation,
  usePartialUpdateOwnerMutation,
  useDestroyOwnerMutation,
} = api;
