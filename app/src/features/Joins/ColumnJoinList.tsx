import React, { useCallback, useEffect, useMemo } from "react";

import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import {
  columnAdded,
  columnSelectors,
  columnUpdated,
  PendingColumn,
} from "features/Columns/columnSlice";
import JoinSelect from "features/Joins/JoinSelect";
import {
  useApiColumnsListQuery,
  useApiJoinsCreateMutation,
  useApiJoinsListQuery,
  useApiJoinsDestroyMutation,
  useApiColumnsCreateMutation,
  useApiColumnsUpdateMutation,
} from "services/api/endpoints";
import { ColumnRequest, Resource } from "services/api/generated/api.generated";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

type ColumnJoinListProps = {
  column?: PendingColumn;
  mapping?: Resource;
};

const ColumnJoinList = ({
  column,
  mapping,
}: ColumnJoinListProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [createJoin] = useApiJoinsCreateMutation();
  const [deleteJoin] = useApiJoinsDestroyMutation();
  const [createColumn] = useApiColumnsCreateMutation();
  const [updateColumn] = useApiColumnsUpdateMutation();
  const {
    data: inputJoins,
    isSuccess: areInputJoinsLoaded,
  } = useApiJoinsListQuery({ column: column?.id ?? "" }, { skip: !column?.id });
  const { data: apiColumns } = useApiColumnsListQuery({});
  const joinsApiColumns = useMemo(
    () =>
      apiColumns?.filter((column) =>
        inputJoins?.find(({ id }) => id === column.join)
      ),
    [apiColumns, inputJoins]
  );
  const joinsLocalColumns = useAppSelector((state) =>
    columnSelectors
      .selectAll(state)
      .filter(
        (column) =>
          column.join && inputJoins?.map(({ id }) => id).includes(column.join)
      )
  );

  const columnsByJoin = useCallback(
    (joinId?: string) =>
      joinsLocalColumns?.filter((column) => column.join === joinId) as [
        PendingColumn,
        PendingColumn
      ],
    [joinsLocalColumns]
  );

  const handleJoinAdd = useCallback(() => {
    column?.id &&
      mapping &&
      createJoin({ joinRequest: { column: column.id } })
        .unwrap()
        .then((join) => {
          dispatch(
            columnAdded({
              id: uuid(),
              owner: mapping.primary_key_owner,
              table: mapping.primary_key_table,
              join: join.id,
              pending: true,
            })
          );
          dispatch(
            columnAdded({
              id: uuid(),
              owner: column.owner,
              table: column.table,
              join: join.id,
              pending: true,
            })
          );
        });
  }, [column?.id, column?.owner, column?.table, createJoin, dispatch, mapping]);

  const handleJoinChange = async (
    leftColumn: PendingColumn,
    rightColumn: PendingColumn
  ) => {
    for (const currentColumn of [leftColumn, rightColumn]) {
      if (currentColumn.id) {
        dispatch(
          columnUpdated({ id: currentColumn.id, changes: currentColumn })
        );
      }

      if (
        currentColumn.id &&
        currentColumn.table &&
        currentColumn.column &&
        currentColumn.owner
      ) {
        try {
          const newColumn = currentColumn.pending
            ? await createColumn({
                columnRequest: currentColumn as ColumnRequest,
              }).unwrap()
            : await updateColumn({
                id: currentColumn.id,
                columnRequest: currentColumn as ColumnRequest,
              }).unwrap();

          dispatch(
            columnUpdated({
              id: currentColumn.id,
              changes: { ...newColumn, pending: false },
            })
          );
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const handleJoinDelete = (joinId: string) => {
    deleteJoin({ id: joinId });
  };

  // Sets joins columns when mounted
  useEffect(() => {
    if (
      inputJoins &&
      joinsApiColumns &&
      joinsLocalColumns &&
      mapping &&
      column
    ) {
      for (const join of inputJoins) {
        const joinApiColumns = joinsApiColumns.filter(
          (column) => column.join === join.id
        );
        const joinLocalColumns = joinsLocalColumns.filter(
          (column) => column.join === join.id
        );

        if (joinLocalColumns.length === 0) {
          dispatch(
            columnAdded(
              joinApiColumns[0] ?? {
                id: uuid(),
                table: column.table,
                owner: column.owner,
                pending: true,
                join: join.id,
              }
            )
          );
          dispatch(
            columnAdded(
              joinApiColumns[1] ?? {
                id: uuid(),
                table: mapping.primary_key_table,
                owner: mapping.primary_key_owner,
                pending: true,
                join: join.id,
              }
            )
          );
        }
      }
    }
  }, [
    column,
    dispatch,
    inputJoins,
    joinsApiColumns,
    joinsLocalColumns,
    mapping,
  ]);

  // Creates a join if join list is loaded and empty
  useEffect(() => {
    if (areInputJoinsLoaded && inputJoins && inputJoins.length === 0) {
      handleJoinAdd();
    }
  }, [inputJoins, areInputJoinsLoaded, handleJoinAdd]);

  return (
    <Grid container direction="column" spacing={1}>
      {inputJoins &&
        inputJoins.map(
          (join) =>
            columnsByJoin(join.id).length === 2 && (
              <JoinSelect
                key={`join-${join.id}`}
                columns={columnsByJoin(join.id)}
                onChange={handleJoinChange}
                onDelete={handleJoinDelete}
              />
            )
        )}
      <Grid item>
        <Button
          className={classes.button}
          startIcon={<AddIcon />}
          onClick={handleJoinAdd}
          variant="outlined"
        >
          <Typography>{t("addJoin")}</Typography>
        </Button>
      </Grid>
    </Grid>
  );
};

export default ColumnJoinList;
