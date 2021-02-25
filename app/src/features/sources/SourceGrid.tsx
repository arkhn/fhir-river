import React from "react";

import { CircularProgress, Grid, makeStyles } from "@material-ui/core";

import { useListSourcesQuery } from "services/api/api";

import SourceCard from "./SourceCard";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    flexGrow: 1,
    paddingBlock: theme.spacing(3),
  },
}));

const SourceGrid = (): JSX.Element => {
  const classes = useStyles();
  const { isLoading, data: sources } = useListSourcesQuery({});

  return (
    <Grid className={classes.gridContainer} container spacing={3}>
      {isLoading ? (
        <CircularProgress />
      ) : (
        sources?.map((source) => (
          <Grid item key={source.id}>
            <SourceCard source={source} />
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default SourceGrid;
