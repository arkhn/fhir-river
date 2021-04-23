import React, { ChangeEvent } from "react";

import { Grid, TextField, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import Select from "common/Select/Select";
import ColumnSelects from "features/Columns/ColumnSelects";
import type {
  Column,
  Filter,
  Owner,
} from "services/api/generated/api.generated";

const FILTER_RELATIONS = ["=", "<>", "IN", ">", ">=", "<", "<="];

const useStyles = makeStyles((theme) => ({
  textInput: {
    minWidth: 200,
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
  },
}));

type FilterSelectsProps = {
  filter: Partial<Filter>;
  column?: Partial<Column>;
  onChange?: (filter?: Partial<Filter>, column?: Partial<Column>) => void;
  owner?: Owner;
};

const FilterSelects = ({
  filter,
  column,
  onChange,
  owner,
}: FilterSelectsProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleTableChange = (table?: string) => {
    onChange && onChange(filter, { table });
  };
  const handleColumnChange = (column?: string) => {
    onChange && onChange(filter, { column });
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
        column={column?.column}
        table={column?.table}
        onTableChange={handleTableChange}
        onColumnChange={handleColumnChange}
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
