import React, { useState } from "react";

import {
  Container,
  CircularProgress,
  Button,
  Typography,
  makeStyles,
} from "@material-ui/core";
import BackIcon from "@material-ui/icons/ArrowBackIos";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import clsx from "clsx";
import differenceBy from "lodash/differenceBy";
import head from "lodash/head";
import isEqual from "lodash/isEqual";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import { useAppSelector } from "app/store";
import Alert from "common/components/Alert";
import useEditMapping from "common/hooks/useEditMapping";
import { columnSelectors } from "features/Columns/columnSlice";
import { filterSelectors } from "features/Filters/filterSlice";
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
} from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";
import {
  ColumnRequest,
  CredentialRequest,
  FilterRequest,
  JoinRequest,
} from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    paddingBlock: theme.spacing(4),
  },
  button: {
    textTransform: "none",
  },
  previousButton: {
    margin: theme.spacing(2),
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "inherit",
      color: theme.palette.text.primary,
    },
  },
}));

const EditMapping = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const [isEditLoading, setEditLoading] = useState(false);
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();
  const { isLoading, data: initialState } = useEditMapping();
  const { resource, filters, joins, columns } = useAppSelector((state) => ({
    resource: resourceSelectors.selectById(state, mappingId ?? ""),
    filters: filterSelectors.selectAll(state),
    joins: joinSelectors.selectAll(state),
    columns: columnSelectors.selectAll(state),
  }));
  const mapping = useAppSelector((state) =>
    resourceSelectors.selectById(state, mappingId ?? "")
  );

  const [updateResource] = useApiResourcesUpdateMutation();

  const [deleteColumn] = useApiColumnsDestroyMutation();
  const [createColumn] = useApiColumnsCreateMutation();
  const [updateColumn] = useApiColumnsUpdateMutation();

  const [deleteFilter] = useApiFiltersDestroyMutation();
  const [createFilter] = useApiFiltersCreateMutation();
  const [updateFilter] = useApiFiltersUpdateMutation();

  const [deleteJoin] = useApiJoinsDestroyMutation();
  const [createJoin] = useApiJoinsCreateMutation();
  const [updateJoin] = useApiJoinsUpdateMutation();

  const handleAlertClose = () => setAlert(undefined);
  const handleCancelClick = () => {
    history.goBack();
  };
  const handleEditSubmit = async () => {
    setEditLoading(true);

    if (resource && initialState) {
      const columnsWithoutJoin = columns.filter(
        (column) => !Boolean(column.join)
      );
      const columnsWithJoin = columns.filter((column) => Boolean(column.join));
      const prevColumnsWithoutJoin = initialState.columns.filter(
        (column) => !Boolean(column.join)
      );
      const prevColumnsWithJoin = initialState.columns.filter((column) =>
        Boolean(column.join)
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
        // Columns without join creation/update
        const createdOrUpdatedColumns = await Promise.all(
          columnsWithoutJoin.map((column) => {
            const prevColumn = prevColumnsWithoutJoin.find(
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
              return column;
            }
          })
        );

        // Filters creation/update
        await Promise.all(
          filters.map((filter) => {
            const prevFilter = initialState.filters.find(
              ({ id }) => id === filter.id
            );
            const index = columnsWithoutJoin.findIndex(
              (column) => column.id === filter.sql_column
            );
            if (!prevFilter) {
              // Filter is created
              return createFilter({
                filterRequest: {
                  ...filter,
                  resource: resource.id,
                  sql_column: createdOrUpdatedColumns[index].id,
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
        const createdOrUpdatedJoins = await Promise.all(
          joins.map((join) => {
            const prevJoin = initialState.joins.find(
              ({ id }) => id === join.id
            );
            const index = columnsWithoutJoin.findIndex(
              (column) => column.id === join.column
            );

            if (!prevJoin) {
              // Join is created
              return createJoin({
                joinRequest: {
                  column: createdOrUpdatedColumns[index].id,
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

        // Join columns creation/update
        await Promise.all(
          columnsWithJoin.map((column) => {
            const prevColumn = prevColumnsWithJoin.find(
              ({ id }) => id === column.id
            );
            const index = joins.findIndex((join) => join.id === column.join);

            if (!prevColumn) {
              // Column is created
              return createColumn({
                columnRequest: {
                  ...column,
                  join: createdOrUpdatedJoins[index].id,
                } as ColumnRequest,
              }).unwrap();
            } else if (!isEqual(prevColumn, column)) {
              // Column is updated
              return updateColumn({
                id: prevColumn.id,
                columnRequest: {
                  ...prevColumn,
                  ...column,
                },
              }).unwrap();
            } else {
              // Column is unchanged
              return column;
            }
          })
        );

        // Delete order is inverted from creation order
        const deletedColumnsWithoutJoin = differenceBy(
          prevColumnsWithoutJoin,
          columnsWithoutJoin,
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
        const deletedColumnsWithJoin = differenceBy(
          prevColumnsWithJoin,
          columnsWithJoin,
          ({ id }) => id
        );
        await Promise.all(
          deletedColumnsWithJoin.map((column) =>
            deleteColumn({ id: column.id }).unwrap()
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
        await Promise.all(
          deletedColumnsWithoutJoin.map((column) =>
            deleteColumn({ id: column.id }).unwrap()
          )
        );
      } catch (error) {
        const data = apiValidationErrorFromResponse<Partial<CredentialRequest>>(
          error as FetchBaseQueryError
        );
        setAlert(head(data?.non_field_errors));
      } finally {
        setEditLoading(false);
      }

      history.push(`/sources/${sourceId}/mappings/${mappingId}`);
    }
  };

  return (
    <>
      <Button
        className={clsx(classes.button, classes.previousButton)}
        startIcon={<BackIcon />}
        onClick={handleCancelClick}
        disableRipple
      >
        <Typography>{t("cancel")}</Typography>
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
              className={classes.button}
              onClick={handleEditSubmit}
              variant="contained"
              color="primary"
              disabled={isEditLoading}
            >
              {isEditLoading ? (
                <CircularProgress />
              ) : (
                <Typography>{t("saveChanges")}</Typography>
              )}
            </Button>
          </>
        ) : (
          <></>
        )}
      </Container>
      <Alert
        severity="error"
        open={!!alert}
        onClose={handleAlertClose}
        message={alert}
      />
    </>
  );
};

export default EditMapping;