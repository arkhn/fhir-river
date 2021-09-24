import { useCallback, useEffect, useState } from "react";

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
  SQLInput,
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
    sqlInputs: SQLInput[];
    joins: Join[];
    columns: Column[];
  };
} => {
  const dispatch = useAppDispatch();
  const mapping = useCurrentMapping();
  const { data: mappingFilters } = useApiFiltersListQuery(
    { resource: mapping?.id },
    { skip: !mapping?.id }
  );
  const { data: sqlInputs } = useApiSqlInputsListQuery(
    {},
    { skip: !mapping?.id }
  );
  const { data: joins } = useApiJoinsListQuery({}, { skip: !mapping?.id });
  const { data: columns } = useApiColumnsListQuery({}, { skip: !mapping?.id });

  const [isMappingInit, setMappingInit] = useState(false);
  const [isFiltersInit, setFiltersInit] = useState(false);
  const [isSqlInputsInit, setSqlInputsInit] = useState(false);
  const [isJoinsInit, setJoinsInit] = useState(false);
  const [isColumnsInit, setColumnsInit] = useState(false);

  const resetEditMapping = useCallback(() => {
    dispatch(resourcesRemoved());
    dispatch(filtersRemoved());
    dispatch(sqlInputsRemoved());
    dispatch(columnsRemoved());
    dispatch(joinsRemoved());
  }, [dispatch]);

  useEffect(() => {
    if (mapping && !isMappingInit) {
      dispatch(resourceAdded(mapping));
      setMappingInit(true);
    }
  }, [dispatch, mapping, isMappingInit]);
  useEffect(() => {
    if (mappingFilters && !isFiltersInit) {
      dispatch(filtersAdded(mappingFilters));
      setFiltersInit(true);
    }
  }, [dispatch, mappingFilters, isFiltersInit]);
  useEffect(() => {
    if (sqlInputs && !isSqlInputsInit) {
      dispatch(sqlInputsAdded(sqlInputs));
      setSqlInputsInit(true);
    }
  }, [dispatch, isSqlInputsInit, sqlInputs]);
  useEffect(() => {
    if (joins && !isJoinsInit) {
      dispatch(joinsAdded(joins));
      setJoinsInit(true);
    }
  }, [dispatch, joins, isJoinsInit]);
  useEffect(() => {
    if (columns && !isColumnsInit) {
      dispatch(columnsAdded(columns));
      setColumnsInit(true);
    }
  }, [dispatch, columns, isColumnsInit]);

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
    isLoading: !(
      isMappingInit &&
      isFiltersInit &&
      isSqlInputsInit &&
      isJoinsInit &&
      isColumnsInit
    ),
    data,
  };
};

export default useInitMappingEdit;
