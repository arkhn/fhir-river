import { useCallback, useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useAppDispatch } from "app/store";
import { columnsAdded, columnsRemoved } from "features/Columns/columnSlice";
import { filtersAdded, filtersRemoved } from "features/Filters/filterSlice";
import { joinsAdded, joinsRemoved } from "features/Joins/joinSlice";
import {
  resourceAdded,
  resourcesRemoved,
} from "features/Mappings/resourceSlice";
import {
  useApiColumnsListQuery,
  useApiFiltersListQuery,
  useApiJoinsListQuery,
  useApiResourcesRetrieveQuery,
} from "services/api/endpoints";
import {
  Column,
  Filter,
  Join,
  Resource,
} from "services/api/generated/api.generated";

/**
 * Initialize the local store with resource, filters, joins & columns related to the URL search param "mappingId"
 *
 * Resets the store on unmount (resourceSlice, filterSlice, joinSlice, columnSlice)
 */
const useEditMapping = (): {
  isLoading: boolean;
  data?: {
    resource: Resource;
    filters: Filter[];
    joins: Join[];
    columns: Column[];
  };
} => {
  const dispatch = useAppDispatch();
  const { mappingId } = useParams<{ mappingId?: string }>();
  const { data: mapping } = useApiResourcesRetrieveQuery(
    { id: mappingId ?? "" },
    { skip: !mappingId }
  );
  const { data: mappingFilters } = useApiFiltersListQuery(
    { resource: mappingId },
    { skip: !mappingId }
  );
  const { data: joins } = useApiJoinsListQuery({}, { skip: !mappingId });
  const { data: columns } = useApiColumnsListQuery({}, { skip: !mappingId });

  const [isMappingInit, setMappingInit] = useState(false);
  const [isFiltersInit, setFiltersInit] = useState(false);
  const [isJoinsInit, setJoinsInit] = useState(false);
  const [isColumnsInit, setColumnsInit] = useState(false);

  const resetEditMapping = useCallback(() => {
    dispatch(resourcesRemoved());
    dispatch(filtersRemoved());
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
    joins &&
    columns && {
      resource: mapping,
      filters: mappingFilters,
      joins,
      columns,
    };

  return {
    isLoading: !(
      isMappingInit &&
      isFiltersInit &&
      isJoinsInit &&
      isColumnsInit
    ),
    data,
  };
};

export default useEditMapping;
