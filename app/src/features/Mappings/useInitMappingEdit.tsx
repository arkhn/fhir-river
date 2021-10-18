import { useCallback, useEffect } from "react";

import { useAppDispatch } from "app/store";
import { columnsAdded, columnsRemoved } from "features/Columns/columnSlice";
import { filtersAdded, filtersRemoved } from "features/Filters/filterSlice";
import {
  sqlInputsAdded,
  sqlInputsRemoved,
} from "features/Inputs/sqlInputSlice";
import { joinsAdded, joinsRemoved } from "features/Joins/joinSlice";
import {
  resourceAdded,
  resourcesRemoved,
} from "features/Mappings/resourceSlice";
import {
  useApiColumnsListQuery,
  useApiFiltersListQuery,
  useApiJoinsListQuery,
  useApiSqlInputsListQuery,
} from "services/api/endpoints";
import {
  Column,
  Filter,
  Join,
  Resource,
  SqlInput,
} from "services/api/generated/api.generated";

import useCurrentMapping from "./useCurrentMapping";

/**
 * Initialize the local store with resource, filters, sqlInputs, joins & columns related to the URL search param "mappingId"
 *
 * Resets the store on unmount (resourceSlice, filterSlice, sqlInputSlice, joinSlice, columnSlice)
 */
const useInitMappingEdit = (): {
  isLoading: boolean;
  data?: {
    resource: Resource;
    filters: Filter[];
    sqlInputs: SqlInput[];
    joins: Join[];
    columns: Column[];
  };
} => {
  const dispatch = useAppDispatch();
  const { data: mapping, isLoading: isMappingLoading } = useCurrentMapping();
  const {
    data: mappingFilters,
    isLoading: isFiltersLoading,
  } = useApiFiltersListQuery({ resource: mapping?.id }, { skip: !mapping?.id });
  const {
    data: sqlInputs,
    isLoading: isSqlInputsLoading,
  } = useApiSqlInputsListQuery({}, { skip: !mapping?.id });
  const { data: joins, isLoading: isJoinsLoading } = useApiJoinsListQuery(
    {},
    { skip: !mapping?.id }
  );
  const { data: columns, isLoading: isColumnsLoading } = useApiColumnsListQuery(
    {},
    { skip: !mapping?.id }
  );

  const resetEditMapping = useCallback(() => {
    dispatch(resourcesRemoved());
    dispatch(filtersRemoved());
    dispatch(sqlInputsRemoved());
    dispatch(columnsRemoved());
    dispatch(joinsRemoved());
  }, [dispatch]);

  useEffect(() => {
    if (mapping && !isMappingLoading) {
      dispatch(resourceAdded(mapping));
    }
  }, [dispatch, mapping, isMappingLoading]);
  useEffect(() => {
    if (mappingFilters && !isFiltersLoading) {
      dispatch(filtersAdded(mappingFilters));
    }
  }, [dispatch, mappingFilters, isFiltersLoading]);
  useEffect(() => {
    if (sqlInputs && !isSqlInputsLoading) {
      dispatch(sqlInputsAdded(sqlInputs));
    }
  }, [dispatch, isSqlInputsLoading, sqlInputs]);
  useEffect(() => {
    if (joins && !isJoinsLoading) {
      dispatch(joinsAdded(joins));
    }
  }, [dispatch, joins, isJoinsLoading]);
  useEffect(() => {
    if (columns && !isColumnsLoading) {
      dispatch(columnsAdded(columns));
    }
  }, [dispatch, columns, isColumnsLoading]);

  useEffect(() => {
    return resetEditMapping;
  }, [resetEditMapping]);

  const data = mapping &&
    mappingFilters &&
    sqlInputs &&
    joins &&
    columns && {
      resource: mapping,
      filters: mappingFilters,
      sqlInputs,
      joins,
      columns,
    };

  return {
    isLoading:
      isMappingLoading ||
      isFiltersLoading ||
      isSqlInputsLoading ||
      isJoinsLoading ||
      isColumnsLoading,
    data,
  };
};

export default useInitMappingEdit;
