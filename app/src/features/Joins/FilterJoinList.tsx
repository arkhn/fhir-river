import React, { useCallback, useEffect } from "react";

import { Grid, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import Button from "common/components/Button";
import {
  columnAdded,
  columnSelectors,
  columnUpdated,
} from "features/Columns/columnSlice";
import { sqlInputSelectors } from "features/Inputs/sqlInputSlice";
import { resourceSelectors } from "features/Mappings/resourceSlice";
import { Column, Filter, Join } from "services/api/generated/api.generated";

import JoinSelect from "./JoinSelect";
import { joinAdded, joinRemoved, joinSelectors } from "./joinSlice";

type JoinProps = {
  filter: Partial<Filter>;
};

const FilterJoinList = ({ filter }: JoinProps): JSX.Element | null => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const filterSqlInput = useAppSelector((state) =>
    sqlInputSelectors.selectById(state, filter.sql_input ?? "")
  );
  const filterColumn = useAppSelector((state) =>
    columnSelectors.selectById(state, filterSqlInput?.column ?? "")
  );
  const mapping = useAppSelector((state) =>
    resourceSelectors.selectById(state, filter.resource ?? "")
  );

  const columns = useAppSelector(columnSelectors.selectAll);
  const filterJoins = useAppSelector((state) =>
    joinSelectors
      .selectAll(state)
      .filter((join) => join.sql_input === filterSqlInput?.id)
  );

  const getColumnById = (id: Column["id"]): Partial<Column> | undefined =>
    columns.find((column) => column.id === id);

  const handleJoinAdd = useCallback(() => {
    const joinId = uuid();
    const leftColumnId = uuid();
    const rightColumnId = uuid();
    dispatch(
      columnAdded({
        id: leftColumnId,
        owner: mapping?.primary_key_owner,
        table: mapping?.primary_key_table,
      })
    );
    dispatch(
      columnAdded({
        id: rightColumnId,
        owner: filterColumn?.owner,
        table: filterColumn?.table,
      })
    );
    dispatch(
      joinAdded({
        id: joinId,
        sql_input: filter.sql_input,
        left: leftColumnId,
        right: rightColumnId,
      })
    );
  }, [
    dispatch,
    filter.sql_input,
    filterColumn?.owner,
    filterColumn?.table,
    mapping?.primary_key_owner,
    mapping?.primary_key_table,
  ]);

  const isMappingPKTableAndFilterTableDifferent =
    filterColumn?.table &&
    mapping &&
    (filterColumn.owner !== mapping.primary_key_owner ||
      filterColumn.table !== mapping.primary_key_table);

  // Add a join automatically if we're on a different table and if there isn't one already
  useEffect(() => {
    if (!filterJoins.length && isMappingPKTableAndFilterTableDifferent)
      handleJoinAdd();
  }, [filterJoins, handleJoinAdd, isMappingPKTableAndFilterTableDifferent]);

  const handleJoinChange = (
    leftColumn: Partial<Column>,
    rightColumn: Partial<Column>
  ) => {
    if (leftColumn.id && rightColumn.id) {
      dispatch(
        columnUpdated({ id: leftColumn.id, changes: { ...leftColumn } })
      );
      dispatch(
        columnUpdated({ id: rightColumn.id, changes: { ...rightColumn } })
      );
    }
  };

  const handleJoinDelete = (joinId: Join["id"]) => () =>
    dispatch(joinRemoved(joinId));

  if (!filterColumn) return null;
  return (
    <Grid container direction="column" spacing={1}>
      {filterJoins.length > 0 && (
        <Grid item>
          <Typography gutterBottom={false}>{t("joinOn")}</Typography>
        </Grid>
      )}
      {filterJoins.map((join) => (
        <JoinSelect
          key={`join-${join.id}`}
          leftColumn={getColumnById(join.left ?? "") ?? {}}
          rightColumn={getColumnById(join.right ?? "") ?? {}}
          onChange={handleJoinChange}
          onDelete={handleJoinDelete(join.id ?? "")}
        />
      ))}
      <Grid item>
        <Button
          startIcon={<AddIcon />}
          onClick={handleJoinAdd}
          variant="outlined"
        >
          {t("addJoin")}
        </Button>
      </Grid>
    </Grid>
  );
};

export default FilterJoinList;
