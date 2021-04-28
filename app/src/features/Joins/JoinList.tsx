import React from "react";

import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import {
  columnAdded,
  columnSelectors,
  columnRemoved,
  columnUpdated,
} from "features/Columns/columnSlice";
import { Column } from "services/api/generated/api.generated";

import JoinSelect from "./JoinSelect";
import { joinAdded, joinRemoved, joinSelectors } from "./joinSlice";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

type JoinProps = {
  column: Partial<Column>;
};

const JoinList = ({ column }: JoinProps): JSX.Element | null => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const columns = useAppSelector((state) => columnSelectors.selectAll(state));
  const joins = useAppSelector((state) => joinSelectors.selectAll(state));
  const columnJoins = joins.filter((join) => join.column === column.id);
  const columnsByJoin = (joinId?: string) =>
    columns.filter((column) => column.join === joinId);

  const handleJoinAdd = () => {
    const joinId = uuid();
    dispatch(
      columnAdded({
        id: uuid(),
        join: joinId,
      })
    );
    dispatch(
      columnAdded({
        id: uuid(),
        join: joinId,
      })
    );
    dispatch(
      joinAdded({
        id: joinId,
        column: column.id,
      })
    );
  };

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

  const handleJoinDelete = (joinId?: string) => {
    if (joinId) {
      const columns = columnsByJoin(joinId);
      columns.forEach((column) => {
        if (column.id) dispatch(columnRemoved(column.id));
      });
      dispatch(joinRemoved(joinId));
    }
  };

  return (
    <>
      {columnJoins.map((join) => (
        <JoinSelect
          key={column.id}
          columns={columnsByJoin(join.id)}
          onChange={handleJoinChange}
          onDelete={handleJoinDelete}
        />
      ))}
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
    </>
  );
};

export default JoinList;
