import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Container,
  CircularProgress,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import differenceBy from "lodash/differenceBy";
import head from "lodash/head";
import isEqual from "lodash/isEqual";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import { useAppSelector } from "app/store";
import Button from "common/components/Button";
import { columnSelectors } from "features/Columns/columnSlice";
import { filterSelectors } from "features/Filters/filterSlice";
import { sqlInputSelectors } from "features/Inputs/sqlInputSlice";
import { joinSelectors } from "features/Joins/joinSlice";
import TableStep from "features/Mappings/Create/TableStep";
import { resourceSelectors } from "features/Mappings/resourceSlice";
import {
  useApiColumnsCreateMutation,
  useApiColumnsUpdateMutation,
  useApiColumnsDestroyMutation,
  useApiFiltersDestroyMutation,
  useApiFiltersCreateMutation,
  useApiFiltersUpdateMutation,
  useApiJoinsDestroyMutation,
  useApiJoinsCreateMutation,
  useApiJoinsUpdateMutation,
  useApiResourcesUpdateMutation,
  useApiSqlInputsDestroyMutation,
  useApiSqlInputsCreateMutation,
  useApiSqlInputsUpdateMutation,
} from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";
import type {
  Column,
  ColumnRequest,
  CredentialRequest,
  FilterRequest,
  JoinRequest,
  SQLInput,
  SQLInputRequest,
} from "services/api/generated/api.generated";

import useInitMappingEdit from "../useInitMappingEdit";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    paddingBlock: theme.spacing(4),
  },
}));

const EditMapping = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [isEditLoading, setEditLoading] = useState(false);
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();
  const { isLoading, data: initialState } = useInitMappingEdit();
  const { resource, filters, sqlInputs, joins, columns } = useAppSelector(
    (state) => ({
      resource: resourceSelectors.selectById(state, mappingId ?? ""),
      filters: filterSelectors.selectAll(state),
      sqlInputs: sqlInputSelectors.selectAll(state),
      joins: joinSelectors.selectAll(state),
      columns: columnSelectors.selectAll(state),
    })
  );
  const mapping = useAppSelector((state) =>
    resourceSelectors.selectById(state, mappingId ?? "")
  );

  const [updateResource] = useApiResourcesUpdateMutation();

  const [deleteColumn] = useApiColumnsDestroyMutation();
  const [createColumn] = useApiColumnsCreateMutation();
  const [updateColumn] = useApiColumnsUpdateMutation();

  const [deleteSqlInput] = useApiSqlInputsDestroyMutation();
  const [createSqlInput] = useApiSqlInputsCreateMutation();
  const [updateSqlInput] = useApiSqlInputsUpdateMutation();

  const [deleteFilter] = useApiFiltersDestroyMutation();
  const [createFilter] = useApiFiltersCreateMutation();
  const [updateFilter] = useApiFiltersUpdateMutation();

  const [deleteJoin] = useApiJoinsDestroyMutation();
  const [createJoin] = useApiJoinsCreateMutation();
  const [updateJoin] = useApiJoinsUpdateMutation();

  const handleCancelClick = () => {
    history.goBack();
  };
  const handleEditSubmit = async () => {
    setEditLoading(true);

    if (resource && initialState) {
      const referencedColumns = columns.filter(
        ({ id }) =>
          sqlInputs.some(({ column }) => column === id) ||
          joins.some(({ left, right }) => left === id || right === id)
      );

      //Resource update
      if (!isEqual(resource, initialState.resource)) {
        await updateResource({
          id: initialState.resource.id,
          resourceRequest: {
            ...initialState.resource,
            ...resource,
          },
        }).unwrap();
      }
      try {
        // Columns creation/update
        const createdOrUpdatedColumns = await Promise.all(
          referencedColumns.map((column) => {
            const prevColumn = initialState.columns.find(
              ({ id }) => id === column.id
            );
            if (!prevColumn) {
              // Column is created
              return createColumn({
                columnRequest: { ...column } as ColumnRequest,
              }).unwrap();
            } else if (!isEqual(column, prevColumn)) {
              // Column is updated
              return updateColumn({
                id: prevColumn.id,
                columnRequest: { ...prevColumn, ...column },
              }).unwrap();
            } else {
              // Column is unchanged
              return column as Column;
            }
          })
        );

        // SqlInputs creation/update
        const createdOrUpdatedSqlInputs = await Promise.all(
          sqlInputs.map((sqlInput) => {
            const prevSqlInput = initialState.sqlInputs.find(
              ({ id }) => id === sqlInput.id
            );
            const index = referencedColumns.findIndex(
              (column) => column.id === sqlInput.column
            );
            if (!prevSqlInput) {
              // SqlInput is created
              return createSqlInput({
                sqlInputRequest: {
                  ...sqlInput,
                  column: createdOrUpdatedColumns[index]?.id ?? "",
                } as SQLInputRequest,
              }).unwrap();
            } else if (!isEqual(sqlInput, prevSqlInput)) {
              // Filter is updated
              return updateSqlInput({
                id: prevSqlInput.id,
                sqlInputRequest: {
                  ...prevSqlInput,
                  ...sqlInput,
                },
              }).unwrap();
            } else {
              // Filter is unchanged
              return sqlInput as SQLInput;
            }
          })
        );

        // Filters creation/update
        await Promise.all(
          filters.map((filter) => {
            const prevFilter = initialState.filters.find(
              ({ id }) => id === filter.id
            );
            const index = sqlInputs.findIndex(
              (sqlInput) => sqlInput.id === filter.sql_input
            );
            if (!prevFilter) {
              // Filter is created
              return createFilter({
                filterRequest: {
                  ...filter,
                  resource: resource.id,
                  sql_input: createdOrUpdatedSqlInputs[index]?.id ?? "",
                } as FilterRequest,
              }).unwrap();
            } else if (!isEqual(filter, prevFilter)) {
              // Filter is updated
              return updateFilter({
                id: prevFilter.id,
                filterRequest: {
                  ...prevFilter,
                  ...filter,
                },
              }).unwrap();
            } else {
              // Filter is unchanged
              return filter;
            }
          })
        );

        // Joins creation/update
        await Promise.all(
          joins.map((join) => {
            const prevJoin = initialState.joins.find(
              ({ id }) => id === join.id
            );
            const index = sqlInputs.findIndex(
              (sqlInput) => sqlInput.id === join.sql_input
            );
            const leftColumnIndex = referencedColumns.findIndex(
              ({ id }) => id === join.left
            );
            const rightColumnIndex = referencedColumns.findIndex(
              ({ id }) => id === join.right
            );
            if (!prevJoin) {
              // Join is created
              return createJoin({
                joinRequest: {
                  sql_input: createdOrUpdatedSqlInputs[index]?.id ?? "",
                  left: createdOrUpdatedColumns[leftColumnIndex]?.id ?? "",
                  right: createdOrUpdatedColumns[rightColumnIndex]?.id ?? "",
                } as JoinRequest,
              }).unwrap();
            } else if (!isEqual(prevJoin, join)) {
              // Join is updated
              return updateJoin({
                id: prevJoin.id,
                joinRequest: { ...prevJoin, ...join },
              }).unwrap();
            } else {
              // Join is unchanged
              return join;
            }
          })
        );

        // Delete order is inverted from creation order
        const deletedColumns = differenceBy(
          initialState.columns,
          columns,
          ({ id }) => id
        );
        const deletedSqlInputs = differenceBy(
          initialState.sqlInputs,
          sqlInputs,
          ({ id }) => id
        );
        const deletedFilters = differenceBy(
          initialState.filters,
          filters,
          ({ id }) => id
        );
        const deletedJoins = differenceBy(
          initialState.joins,
          joins,
          ({ id }) => id
        );
        await Promise.all(
          deletedColumns.map((column) =>
            deleteColumn({ id: column.id }).unwrap()
          )
        );
        await Promise.all(
          deletedSqlInputs.map((sqlInput) =>
            deleteSqlInput({ id: sqlInput.id }).unwrap()
          )
        );
        await Promise.all(
          deletedJoins.map((join) => deleteJoin({ id: join.id }).unwrap())
        );
        await Promise.all(
          deletedFilters.map((filter) =>
            deleteFilter({ id: filter.id }).unwrap()
          )
        );
      } catch (error) {
        const data = apiValidationErrorFromResponse<Partial<CredentialRequest>>(
          error as FetchBaseQueryError
        );
        enqueueSnackbar(head(data?.non_field_errors), { variant: "error" });
      } finally {
        setEditLoading(false);
      }

      history.push(`/sources/${sourceId}/mappings/${mappingId}`);
    }
  };

  return (
    <>
      <Button
        startIcon={<Icon icon={IconNames.CHEVRON_LEFT} />}
        color="inherit"
        onClick={handleCancelClick}
        disableRipple
      >
        {t("cancel")}
      </Button>
      <Container maxWidth="lg">
        {isLoading ? (
          <CircularProgress />
        ) : mapping ? (
          <>
            <Typography variant="h6" gutterBottom>
              Source table
            </Typography>
            <div className={classes.contentContainer}>
              <TableStep mapping={mapping} />
            </div>
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              color="primary"
              disabled={isEditLoading}
            >
              {isEditLoading ? <CircularProgress /> : t("saveChanges")}
            </Button>
          </>
        ) : (
          <></>
        )}
      </Container>
    </>
  );
};

export default EditMapping;
