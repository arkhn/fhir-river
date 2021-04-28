import React, { ChangeEvent } from "react";

import { Grid, TextField, makeStyles, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import Select from "common/components/Select";
import ColumnSelect from "features/Columns/ColumnSelect";
import {
  columnRemoved,
  columnSelectors,
  columnUpdated,
} from "features/Columns/columnSlice";
import JoinList from "features/Joins/JoinList";
import type { Column, Filter } from "services/api/generated/api.generated";

import { joinRemoved, joinSelectors } from "../Joins/joinSlice";
import { filterRemoved, filterUpdated } from "./filterSlice";

const FILTER_RELATIONS = ["=", "<>", "IN", ">", ">=", "<", "<="];

const useStyles = makeStyles((theme) => ({
  textInput: {
    minWidth: 200,
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
  },
  leftShift: {
    paddingLeft: theme.spacing(5),
    width: "100%",
  },
}));

type FilterSelectsProps = {
  filter: Partial<Filter>;
};

const FilterSelect = ({ filter }: FilterSelectsProps): JSX.Element | null => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const filterColumn = useAppSelector((state) =>
    columnSelectors.selectById(state, filter.sql_column ?? "")
  );
  const joins = useAppSelector((state) => joinSelectors.selectAll(state));
  const columns = useAppSelector((state) => columnSelectors.selectAll(state));

  const handleFilterColumnChange = (column?: Partial<Column>) => {
    if (filter.sql_column)
      dispatch(
        columnUpdated({ id: filter.sql_column, changes: { ...column } })
      );
  };

  const handleRelationChange = (
    event: ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    if (filter.id)
      dispatch(
        filterUpdated({
          id: filter.id,
          changes: { relation: event.target.value as typeof filter.relation },
        })
      );
  };
  const handleValueChange = (
    event: ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    if (filter.id)
      dispatch(
        filterUpdated({
          id: filter.id,
          changes: { value: event.target.value as typeof filter.value },
        })
      );
  };

  const handleFilterDelete = () => {
    if (filterColumn) {
      const filterJoins = joins.filter(
        (join) => join.column === filterColumn.id
      );
      filterJoins.forEach((join) => {
        columns
          .filter((column) => column.id === join.column)
          .forEach((column) => {
            if (column.id) dispatch(columnRemoved(column.id));
          });
        if (join.id) dispatch(joinRemoved(join.id));
      });
      if (filter.sql_column) dispatch(columnRemoved(filter.sql_column));
    }
    if (filter.id) dispatch(filterRemoved(filter.id));
  };

  if (!filterColumn) return null;
  return (
    <Grid item container direction="column" spacing={2}>
      <Grid item container xs={12} spacing={2}>
        <ColumnSelect
          pendingColumn={filterColumn}
          onChange={handleFilterColumnChange}
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
        <Grid item>
          <IconButton onClick={handleFilterDelete}>
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid item container>
        <div className={classes.leftShift}>
          <JoinList filter={filter} />
        </div>
      </Grid>
    </Grid>
  );
};

export default FilterSelect;
