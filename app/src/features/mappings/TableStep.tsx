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
import ColumnSelects from "features/columns/ColumnSelects";
import FilterSelects from "features/filters/FilterSelects";
import { Owner, Resource } from "services/api/generated/api.generated";

import { addFilter, FilterPending, updateFilter } from "./mappingSlice";

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

const TableStep = ({
  onChange,
  mapping,
  owner,
}: TableStepProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.mapping.filters);

  const handleAddFilterClick = () => {
    dispatch(addFilter());
  };
  const handleFilterChange = (filter: FilterPending) => {
    dispatch(updateFilter(filter));
  };
  const handlePKTableChange = (primary_key_table?: string) => {
    onChange && onChange({ primary_key_table });
  };
  const handlePKColumnChange = (primary_key_column?: string) => {
    onChange && onChange({ primary_key_column });
  };

  return (
    <Container maxWidth="md">
      <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2}>
          <ColumnSelects
            owner={owner}
            PKTable={mapping.primary_key_table}
            PKColumn={mapping.primary_key_column}
            onPKTableChange={handlePKTableChange}
            onPKColumnChange={handlePKColumnChange}
          />
        </Grid>
        {filters && filters.length > 0 && (
          <Grid item container spacing={1} direction="column">
            <Grid item>
              <Typography gutterBottom={false}>Filter on :</Typography>
            </Grid>
            {filters.map((filter, index) => (
              <Grid item container key={`filter ${index}`}>
                <FilterSelects
                  filter={filter}
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
