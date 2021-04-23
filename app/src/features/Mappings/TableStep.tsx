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
import FilterSelects from "features/Filters/FilterSelects";
import type {
  Column,
  Filter,
  Owner,
  Resource,
} from "services/api/generated/api.generated";

import {
  columnAdded,
  columnSelectors,
  columnUpdated,
} from "../Columns/columnSlice";
import {
  filterAdded,
  filterSelectors,
  filterUpdated,
} from "../Filters/filterSlice";
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
  owner: Owner;
};

const TableStep = ({ mapping, owner }: TableStepProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const filters = filterSelectors.selectAll(store.getState());

  const columnById = (id: string) =>
    columnSelectors.selectById(store.getState(), id);

  const handleAddFilterClick = () => {
    const columnId = uuid();
    dispatch(columnAdded({ id: columnId, owner: owner.id }));
    dispatch(filterAdded({ id: uuid(), resource: "0", sql_column: columnId }));
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
    dispatch(resourceUpdated({ id: "0", changes: { primary_key_table } }));
  };
  const handlePKColumnChange = (primary_key_column?: string) => {
    dispatch(resourceUpdated({ id: "0", changes: { primary_key_column } }));
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
