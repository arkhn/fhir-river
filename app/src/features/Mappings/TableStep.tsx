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

import { useAppDispatch, useAppSelector } from "app/store";
import ColumnSelects from "features/Columns/ColumnSelects";
import { columnAdded, columnUpdated } from "features/Columns/columnSlice";
import FilterSelects from "features/Filters/FilterSelects";
import {
  filterAdded,
  filterSelectors,
  filterUpdated,
} from "features/Filters/filterSlice";
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

  const filters = useAppSelector((state) => filterSelectors.selectAll(state));

  const mappingColumn: Partial<Column> = {
    owner: mapping.primary_key_owner,
    table: mapping.primary_key_table,
    column: mapping.primary_key_column,
  };

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

  const handleColumnChange = (column: Partial<Column>) => {
    if (mapping.id)
      dispatch(
        resourceUpdated({
          id: mapping.id,
          changes: {
            primary_key_owner: column.owner,
            primary_key_column: column.column,
            primary_key_table: column.table,
          },
        })
      );
  };

  return (
    <Container maxWidth="xl">
      <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2}>
          <ColumnSelects column={mappingColumn} onChange={handleColumnChange} />
        </Grid>
        {filters && filters.length > 0 && (
          <Grid item container spacing={1} direction="column">
            <Grid item>
              <Typography gutterBottom={false}>{t("filterOn")}</Typography>
            </Grid>
            <Grid item container spacing={5} direction="column">
              {filters.map((filter, index) => (
                <FilterSelects
                  key={`filter-${index}`}
                  mapping={mapping}
                  filter={filter}
                  onChange={handleFilterChange}
                />
              ))}
            </Grid>
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
