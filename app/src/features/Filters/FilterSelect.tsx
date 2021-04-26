import React, { ChangeEvent, useEffect } from "react";

import { Grid, TextField, makeStyles, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import Select from "common/components/Select";
import ColumnSelect from "features/Columns/ColumnSelect";
import { selectColumnById } from "features/Columns/columnSlice";
import JoinSection from "features/Joins/JoinSection";
import { joinAdded, joinSelectors } from "features/Joins/joinSlice";
import type {
  Column,
  Filter,
  Resource,
} from "services/api/generated/api.generated";

import { filterRemoved } from "./filterSlice";

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
  mapping?: Partial<Resource>;
  filter: Partial<Filter>;
  onChange?: (filter?: Partial<Filter>, column?: Partial<Column>) => void;
};

const FilterSelect = ({
  mapping,
  filter,
  onChange,
}: FilterSelectsProps): JSX.Element | null => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const columnById = useAppSelector(selectColumnById);
  const filterColumn = columnById(filter.sql_column ?? "");

  const joins = useAppSelector((state) => joinSelectors.selectAll(state));

  const isMappingPKTableAndFilterPKTableDifferent = Boolean(
    filterColumn?.table &&
      mapping?.primary_key_table &&
      filterColumn?.table !== mapping?.primary_key_table
  );

  useEffect(() => {
    if (
      joins.length === 0 &&
      isMappingPKTableAndFilterPKTableDifferent &&
      filterColumn?.id
    ) {
      dispatch(
        joinAdded({
          id: uuid(),
          column: filterColumn.id,
        })
      );
    }
  }, [isMappingPKTableAndFilterPKTableDifferent]);

  const handleFilterColumnChange = (column?: Partial<Column>) => {
    onChange && onChange(filter, column);
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
  const handleFilterDelete = () => {
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
              label: t("relation"),
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
      {joins.length > 0 && (
        <Grid item container>
          <div className={classes.leftShift}>
            <JoinSection
              isFirstJoinRequired={isMappingPKTableAndFilterPKTableDifferent}
            />
          </div>
        </Grid>
      )}
    </Grid>
  );
};

export default FilterSelect;
