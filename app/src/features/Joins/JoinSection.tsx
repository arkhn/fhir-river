import React from "react";

import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import {
  columnAdded,
  columnSelectors,
  columnUpdated,
  selectColumnById,
} from "features/Columns/columnSlice";
import { Column } from "services/api/generated/api.generated";

import JoinSelect from "./JoinSelect";
import { joinAdded, joinRemoved, selectJoinById } from "./joinSlice";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

type JoinSectionProps = {
  isFirstJoinRequired?: boolean;
};

const JoinSection = ({
  isFirstJoinRequired,
}: JoinSectionProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const joinById = useAppSelector(selectJoinById);
  const columnById = useAppSelector(selectColumnById);
  const columns = useAppSelector((state) => columnSelectors.selectAll(state));

  const columnsWihJoin = columns.filter((column) => Boolean(column.join));

  const joinedColumnByColumn = (
    column: Partial<Column>
  ): Partial<Column> | undefined => {
    const joinId = column.join;
    if (joinId) {
      const join = joinById(joinId);
      if (join?.id) return columnById(join.id);
    }
  };

  const handleAddJoinClick = () => {
    // TODO: add owner to column
    const columnId = uuid();
    dispatch(
      columnAdded({
        id: columnId,
      })
    );
    dispatch(
      joinAdded({
        id: uuid(),
        column: columnId,
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
    if (joinId) dispatch(joinRemoved(joinId));
  };

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <Typography gutterBottom={false}>{t("joinOn")}</Typography>
      </Grid>
      {columnsWihJoin.map((column, index) => (
        <JoinSelect
          key={column.id}
          leftColumn={column}
          rightColumn={joinedColumnByColumn(column) as Partial<Column>}
          onChange={handleJoinChange}
          onDelete={handleJoinDelete}
          disableDelete={isFirstJoinRequired && index === 0}
        />
      ))}
      <Grid item>
        <Button
          className={classes.button}
          startIcon={<AddIcon />}
          onClick={handleAddJoinClick}
          variant="outlined"
        >
          <Typography>{t("addJoin")}</Typography>
        </Button>
      </Grid>
    </Grid>
  );
};

export default JoinSection;
