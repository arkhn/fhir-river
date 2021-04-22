import React from "react";

import { IconButton, Grid, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import ColumnSelects from "features/Columns/ColumnSelects";
import { PendingJoin } from "features/Mappings/mappingSlice";
import { Owner } from "services/api/generated/api.generated";

type JoinSelectsProps = {
  join: PendingJoin;
  owner?: Owner;
  disableDelete?: boolean;
  onChange?: (join: PendingJoin) => void;
  onDelete?: (joinId: string) => void;
};

const JoinSelects = ({
  join,
  owner,
  onChange,
  onDelete,
  disableDelete,
}: JoinSelectsProps): JSX.Element => {
  const [leftColumn, rightColumn] = join.columns;

  const handlePKTableAChange = (table?: string) => {
    onChange &&
      onChange({ ...join, columns: [{ ...leftColumn, table }, rightColumn] });
  };
  const handlePKTableBChange = (table?: string) => {
    onChange &&
      onChange({ ...join, columns: [leftColumn, { ...rightColumn, table }] });
  };
  const handlePKColumnAChange = (column?: string) => {
    onChange &&
      onChange({ ...join, columns: [{ ...leftColumn, column }, rightColumn] });
  };
  const handlePKColumnBChange = (column?: string) => {
    onChange &&
      onChange({ ...join, columns: [leftColumn, { ...rightColumn, column }] });
  };
  const handleJoinDelete = () => {
    onDelete && onDelete(join.id);
  };

  return (
    <Grid
      item
      container
      xs={12}
      spacing={2}
      direction="row"
      alignItems="center"
    >
      <ColumnSelects
        owner={owner}
        PKColumn={leftColumn.column}
        PKTable={leftColumn.table}
        onPKTableChange={handlePKTableAChange}
        onPKColumnChange={handlePKColumnAChange}
      />
      <Typography> == </Typography>
      <ColumnSelects
        owner={owner}
        PKColumn={rightColumn.column}
        PKTable={rightColumn.table}
        onPKTableChange={handlePKTableBChange}
        onPKColumnChange={handlePKColumnBChange}
      />
      <Grid item>
        <IconButton onClick={handleJoinDelete} disabled={disableDelete}>
          <CloseIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default JoinSelects;
