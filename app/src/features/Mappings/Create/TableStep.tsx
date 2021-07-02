import React from "react";

import { Container, Grid, makeStyles, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import ColumnSelect from "features/Columns/ColumnSelect";
import FilterSelect from "features/Filters/FilterSelect";
import { filterSelectors } from "features/Filters/filterSlice";
import type { Column, Resource } from "services/api/generated/api.generated";

import FilterAddButton from "../../Filters/FilterAddButton";
import { resourceUpdated } from "../resourceSlice";

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
  },
  icon: {
    paddingRight: theme.spacing(1),
    fill: theme.palette.icons.disabled.main,
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

  const filters = useAppSelector(filterSelectors.selectAll);

  const mappingColumn: Partial<Column> = {
    owner: mapping.primary_key_owner,
    table: mapping.primary_key_table,
    column: mapping.primary_key_column,
  };

  const handleColumnChange = ({ owner, table, column }: Partial<Column>) => {
    if (mapping.id)
      dispatch(
        resourceUpdated({
          id: mapping.id,
          changes: {
            primary_key_owner: owner,
            primary_key_column: column,
            primary_key_table: table,
          },
        })
      );
  };

  return (
    <Container maxWidth="xl">
      <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2}>
          <ColumnSelect
            pendingColumn={mappingColumn}
            onChange={handleColumnChange}
          />
        </Grid>
        {filters && filters.length > 0 && (
          <Grid item container spacing={1} direction="column">
            <Grid item>
              <Typography gutterBottom={false}>{t("filterOn")}</Typography>
            </Grid>
            <Grid item container spacing={5} direction="column">
              {filters.map((filter, index) => (
                <FilterSelect key={`filter-${index}`} filter={filter} />
              ))}
            </Grid>
          </Grid>
        )}
        <Grid item>
          <FilterAddButton
            className={classes.button}
            startIcon={<AddIcon />}
            variant="outlined"
            mapping={mapping}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default TableStep;
