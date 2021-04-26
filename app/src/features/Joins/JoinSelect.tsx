import React from "react";

import { IconButton, Grid, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import ColumnSelects from "features/Columns/ColumnSelect";
import { PendingJoin } from "features/Mappings/mappingSlice";
import { Column } from "services/api/generated/api.generated";

type JoinSelectsProps = {
  join: PendingJoin;
  disableDelete?: boolean;
  onChange?: (join: PendingJoin) => void;
  onDelete?: (joinId: string) => void;
};

const JoinSelects = ({
  join,
  onChange,
  onDelete,
  disableDelete,
}: JoinSelectsProps): JSX.Element => {
  const [leftColumn, rightColumn] = join.columns;

  const handleLeftColumnChange = (column: Partial<Column>) => {
    onChange && onChange({ ...join, columns: [column, rightColumn] });
  };
  const handleRightColumnChange = (column: Partial<Column>) => {
    onChange && onChange({ ...join, columns: [leftColumn, column] });
  };
  const handleJoinDelete = () => {
    onDelete && onDelete(join.id);
  };

  return (
    <Grid item container xs={12} spacing={2} alignItems="center">
      <ColumnSelects
        pendingColumn={leftColumn}
        onChange={handleLeftColumnChange}
      />
      <Typography>==</Typography>
      <ColumnSelects
        pendingColumn={rightColumn}
        onChange={handleRightColumnChange}
      />
      <IconButton onClick={handleJoinDelete} disabled={disableDelete}>
        <CloseIcon />
      </IconButton>
    </Grid>
  );
};

export default JoinSelects;
