import React from "react";

import {
  Container,
  Grid,
  makeStyles,
  Button,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { store, useAppDispatch } from "app/store";
import ColumnSelects from "features/Columns/ColumnSelects";
import {
  columnAdded,
  columnSelectors,
  columnUpdated,
} from "features/Columns/columnSlice";
import FilterSelects from "features/Filters/FilterSelects";
import {
  filterAdded,
  filterSelectors,
  filterUpdated,
} from "features/Filters/filterSlice";
import {
  useApiCredentialsListQuery,
  useApiOwnersListQuery,
} from "services/api/endpoints";
import type {
  Column,
  Filter,
  Resource,
} from "services/api/generated/api.generated";

import { resourceUpdated } from "./resourceSlice";

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
  },
  icon: {
    paddingRight: theme.spacing(1),
    fill: theme.palette.text.disabled,
  },
  iconSelected: {
    fill: theme.palette.secondary.main,
  },
  inputSelected: {
    fontWeight: 500,
  },
}));

type TableStepProps = {
  mapping: Partial<Resource>;
};

const TableStep = ({ mapping }: TableStepProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { data: credential } = useApiCredentialsListQuery(
    {
      source: mapping.source,
    },
    { skip: !mapping.source }
  );
  const { data: owners } = useApiOwnersListQuery({
    credential: credential?.[0].id,
  });
  const owner = owners?.[0];

  const filters = filterSelectors.selectAll(store.getState());

  const columnById = (id: string) =>
    columnSelectors.selectById(store.getState(), id);

  const handleAddFilterClick = () => {
    const columnId = uuid();

    dispatch(columnAdded({ id: columnId, owner: mapping.primary_key_owner }));
    dispatch(
      filterAdded({ id: uuid(), resource: mapping.id, sql_column: columnId })
    );
  };
  const handleFilterChange = (
    filter?: Partial<Filter>,
    column?: Partial<Column>
  ) => {
    if (filter?.id)
      dispatch(filterUpdated({ id: filter.id, changes: { ...filter } }));
    if (filter?.sql_column)
      dispatch(
        columnUpdated({ id: filter.sql_column, changes: { ...column } })
      );
  };
  const handlePKTableChange = (primary_key_table?: string) => {
    if (mapping.id)
      dispatch(
        resourceUpdated({ id: mapping.id, changes: { primary_key_table } })
      );
  };
  const handlePKColumnChange = (primary_key_column?: string) => {
    if (mapping.id)
      dispatch(
        resourceUpdated({ id: mapping.id, changes: { primary_key_column } })
      );
  };

  return (
    <Container maxWidth="md">
      <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2}>
          <ColumnSelects
            owner={owner}
            table={mapping.primary_key_table}
            column={mapping.primary_key_column}
            onTableChange={handlePKTableChange}
            onColumnChange={handlePKColumnChange}
          />
        </Grid>
        {filters && filters.length > 0 && (
          <Grid item container spacing={1} direction="column">
            <Grid item>
              <Typography gutterBottom={false}>Filter on :</Typography>
            </Grid>
            {filters.map((filter, index) => (
              <Grid item container key={`filter-${index}`}>
                <FilterSelects
                  filter={filter}
                  column={columnById(filter.sql_column ?? "")}
                  owner={owner}
                  onChange={handleFilterChange}
                />
              </Grid>
            ))}
          </Grid>
        )}
        <Grid item>
          <Button
            className={classes.button}
            startIcon={<AddIcon />}
            onClick={handleAddFilterClick}
            variant="outlined"
          >
            <Typography>{t("addFilter")}</Typography>
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TableStep;
