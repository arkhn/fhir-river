import React, { ChangeEvent, useEffect } from "react";

import { IconButton, Grid, TextField, makeStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import Select from "common/components/Select";
import ColumnSelects from "features/Columns/ColumnSelect";
import JoinSection from "features/Joins/JoinSection";
import {
  addJoin,
  deleteFilter,
  PendingFilter,
} from "features/Mappings/mappingSlice";
import { Column, Resource } from "services/api/generated/api.generated";

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
  filter: PendingFilter;
  onChange?: (filter: PendingFilter) => void;
};

const FilterSelects = ({
  mapping,
  filter,
  onChange,
}: FilterSelectsProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const joins = useAppSelector(
    (state) => state.mapping.joins?.[filter.col?.id ?? ""] ?? []
  );
  const filterColumn = filter.col ?? {};
  const { table } = filterColumn;
  const isMappingPKTableAndFilterPKTableDifferent = Boolean(
    table && mapping?.primary_key_table && table !== mapping?.primary_key_table
  );

  useEffect(() => {
    if (joins.length === 0 && isMappingPKTableAndFilterPKTableDifferent) {
      filter.col?.id && dispatch(addJoin(filter.col?.id));
    }
  }, [isMappingPKTableAndFilterPKTableDifferent]);

  const handleFilterColumnChange = (col?: Partial<Column>) => {
    onChange &&
      onChange({
        ...filter,
        col,
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
  const handleFilterDelete = () => {
    filter.id && dispatch(deleteFilter(filter.id));
  };

  return (
    <Grid item container direction="column" spacing={2}>
      <Grid item container xs={12} spacing={2}>
        <ColumnSelects
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
      {joins.length > 0 && (
        <Grid item container>
          <div className={classes.leftShift}>
            <JoinSection
              column={filter.col}
              joins={joins}
              isFirstJoinRequired={isMappingPKTableAndFilterPKTableDifferent}
            />
          </div>
        </Grid>
      )}
    </Grid>
  );
};

export default FilterSelects;
