import React from "react";

import { IconButton, Grid, makeStyles, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import { useAppDispatch } from "app/store";
import ColumnSelects from "features/columns/ColumnSelects";
import {
  deleteJoin,
  JoinPending,
  updateJoin,
} from "features/mappings/mappingSlice";
import { Owner } from "services/api/generated/api.generated";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles(() => ({}));

type FilterSelectsProps = {
  filter?: string;
  join: JoinPending;
  owner?: Owner;
  disableDelete?: boolean;
};

const FilterSelects = ({
  filter,
  join,
  owner,
  disableDelete,
}: FilterSelectsProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const [columnA, columnB] = join.columns;

  const handlePKTableAChange = (table?: string) => {
    filter &&
      dispatch(
        updateJoin({
          filter,
          join: { ...join, columns: [{ ...columnA, table }, columnB] },
        })
      );
  };
  const handlePKTableBChange = (table?: string) => {
    filter &&
      dispatch(
        updateJoin({
          filter,
          join: { ...join, columns: [columnA, { ...columnB, table }] },
        })
      );
  };
  const handlePKColumnAChange = (column?: string) => {
    filter &&
      dispatch(
        updateJoin({
          filter,
          join: { ...join, columns: [{ ...columnA, column }, columnB] },
        })
      );
  };
  const handlePKColumnBChange = (column?: string) => {
    filter &&
      dispatch(
        updateJoin({
          filter,
          join: { ...join, columns: [columnA, { ...columnB, column }] },
        })
      );
  };
  const handleJoinDelete = () => {
    filter && dispatch(deleteJoin({ filter, join: join.id }));
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
        PKColumn={columnA.column}
        PKTable={columnA.table}
        onPKTableChange={handlePKTableAChange}
        onPKColumnChange={handlePKColumnAChange}
      />
      <Typography> == </Typography>
      <ColumnSelects
        owner={owner}
        PKColumn={columnB.column}
        PKTable={columnB.table}
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

export default FilterSelects;
