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

import { useAppDispatch, useAppSelector } from "app/store";
import ColumnSelects from "features/Columns/ColumnSelects";
import FilterSelects from "features/Filters/FilterSelects";
import { Column, Owner, Resource } from "services/api/generated/api.generated";

import { addFilter, PendingFilter, updateFilter } from "./mappingSlice";

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
  owner?: Owner;
  onChange?: (mapping: Partial<Resource>) => void;
};

const TableStep = ({ onChange, mapping }: TableStepProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.mapping.filters);
  const mappingColumn: Partial<Column> = {
    owner: mapping.primary_key_owner,
    table: mapping.primary_key_table,
    column: mapping.primary_key_column,
  };

  const handleAddFilterClick = () => {
    dispatch(addFilter());
  };
  const handleFilterChange = (filter: PendingFilter) => {
    dispatch(updateFilter(filter));
  };
  const handleFilterColumnChange = (column: Partial<Column>) => {
    onChange &&
      onChange({
        primary_key_owner: column.owner,
        primary_key_table: column.table,
        primary_key_column: column.column,
      });
  };

  return (
    <Container maxWidth="xl">
      <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2}>
          <ColumnSelects
            pendingColumn={mappingColumn}
            onChange={handleFilterColumnChange}
          />
        </Grid>
        {filters && filters.length > 0 && (
          <Grid item container spacing={1} direction="column">
            <Grid item>
              <Typography gutterBottom={false}>{t("filterOn")}</Typography>
            </Grid>
            <Grid item container spacing={5} direction="column">
              {filters.map((filter, index) => (
                <FilterSelects
                  key={`filter ${index}`}
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
