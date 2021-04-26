import React from "react";

import { IconButton, Grid, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import ColumnSelect from "features/Columns/ColumnSelect";
import { Column } from "services/api/generated/api.generated";

type JoinSelectsProps = {
  leftColumn: Partial<Column>;
  rightColumn: Partial<Column>;
  disableDelete?: boolean;
  onChange?: (
    leftColumn: Partial<Column>,
    rightColumn: Partial<Column>
  ) => void;
  onDelete?: (joinId?: string) => void;
};

const JoinSelect = ({
  leftColumn,
  rightColumn,
  onChange,
  onDelete,
  disableDelete,
}: JoinSelectsProps): JSX.Element => {
  const handleLeftColumnChange = (column: Partial<Column>) => {
    onChange && onChange(column, rightColumn);
  };
  const handleRightColumnChange = (column: Partial<Column>) => {
    onChange && onChange(leftColumn, column);
  };
  const handleJoinDelete = () => {
    onDelete && onDelete(leftColumn.join ?? undefined);
  };

  return (
    <Grid item container xs={12} spacing={2} alignItems="center">
      <ColumnSelect column={leftColumn} onChange={handleLeftColumnChange} />
      <Typography>==</Typography>
      <ColumnSelect column={rightColumn} onChange={handleRightColumnChange} />
      <IconButton onClick={handleJoinDelete} disabled={disableDelete}>
        <CloseIcon />
      </IconButton>
    </Grid>
  );
};

export default JoinSelect;
