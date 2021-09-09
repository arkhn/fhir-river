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
  columnRemoved,
  columnUpdated,
} from "features/Columns/columnSlice";
import { resourceSelectors } from "features/Mappings/resourceSlice";
import { Column, Filter } from "services/api/generated/api.generated";

import JoinSelect from "./JoinSelect";
import { joinAdded, joinRemoved, joinSelectors } from "./joinSlice";

type JoinProps = {
  filter: Partial<Filter>;
};

const FilterJoinList = ({ filter }: JoinProps): JSX.Element | null => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const filterColumn = useAppSelector((state) =>
    columnSelectors.selectById(state, filter.sql_column ?? "")
  );
  const mapping = useAppSelector((state) =>
    resourceSelectors.selectById(state, filter.resource ?? "")
  );

  const columns = useAppSelector(columnSelectors.selectAll);
  const filterJoins = useAppSelector((state) =>
    joinSelectors
      .selectAll(state)
      .filter((join) => join.column === filterColumn?.id)
  );

  const columnsByJoin = (joinId?: string) =>
    columns.filter((column) => column.join === joinId) as [
      Partial<Column>,
      Partial<Column>
    ];

  const handleJoinAdd = useCallback(() => {
    const joinId = uuid();
    dispatch(
      columnAdded({
        id: uuid(),
        join: joinId,
        owner: mapping?.primary_key_owner,
        table: mapping?.primary_key_table,
      })
    );
    dispatch(
      columnAdded({
        id: uuid(),
        join: joinId,
        owner: filterColumn?.owner,
        table: filterColumn?.table,
      })
    );
    dispatch(
      joinAdded({
        id: joinId,
        column: filterColumn?.id,
      })
    );
  }, [
    dispatch,
    filterColumn?.id,
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

  useEffect(() => {
    if (filterJoins.length === 0 && isMappingPKTableAndFilterTableDifferent)
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

  const handleJoinDelete = (joinId: string) => {
    const columns = columnsByJoin(joinId);
    columns.forEach((column) => {
      if (column.id) dispatch(columnRemoved(column.id));
    });
    dispatch(joinRemoved(joinId));
  };

  if (!filterColumn) return null;
  return (
    <Grid container direction="column" spacing={1}>
      {filterColumn.join && (
        <Grid item>
          <Typography gutterBottom={false}>{t("joinOn")}</Typography>
        </Grid>
      )}
      {filterJoins.map((join) => (
        <JoinSelect
          key={`join-${join.id}`}
          columns={columnsByJoin(join.id)}
          onChange={handleJoinChange}
          onDelete={handleJoinDelete}
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
