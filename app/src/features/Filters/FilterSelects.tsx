import React, { ChangeEvent } from "react";

import { Grid, TextField, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import Select from "common/Select/Select";
import ColumnSelects from "features/Columns/ColumnSelects";
import { FilterPending } from "features/Mappings/mappingSlice";
import { Owner } from "services/api/generated/api.generated";

const FILTER_RELATIONS = ["=", "<>", "IN", ">", ">=", "<", "<="];

const useStyles = makeStyles((theme) => ({
  textInput: {
    minWidth: 200,
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
  },
}));

type FilterSelectsProps = {
  filter: FilterPending;
  onChange?: (filter: FilterPending) => void;
  owner?: Owner;
};

const FilterSelects = ({
  filter,
  onChange,
  owner,
}: FilterSelectsProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const PKTable = filter.col?.table;
  const PKColumn = filter.col?.column;

  const handlePKTableChange = (table?: string) => {
    onChange &&
      onChange({
        ...filter,
        col: {
          ...filter.col,
          table,
        },
      });
  };
  const handlePKColumnChange = (column?: string) => {
    onChange &&
      onChange({
        ...filter,
        col: {
          ...filter.col,
          column,
        },
      });
  };
  const handleRelationChange = (
    event: ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    onChange &&
      onChange({
        ...filter,
        relation: event.target.value as typeof filter.relation,
      });
  };
  const handleValueChange = (
    event: ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    onChange &&
      onChange({
        ...filter,
        value: event.target.value as string,
      });
  };

  return (
    <Grid item container xs={12} spacing={2} direction="row">
      <ColumnSelects
        owner={owner}
        PKColumn={PKColumn}
        PKTable={PKTable}
        onPKTableChange={handlePKTableChange}
        onPKColumnChange={handlePKColumnChange}
      />
      <Grid item>
        <Select
          value={filter.relation ?? ""}
          options={FILTER_RELATIONS.map((relation) => ({
            id: relation,
            label: t(relation),
          }))}
          onChange={handleRelationChange}
          emptyOption={t("selectOperation")}
        />
      </Grid>
      <Grid item>
        <TextField
          className={classes.textInput}
          value={filter.value}
          onChange={handleValueChange}
          placeholder={t("typeValue")}
          variant="outlined"
          size="small"
        />
      </Grid>
    </Grid>
  );
};

export default FilterSelects;
