import React from "react";

import { CircularProgress, Grid, makeStyles } from "@material-ui/core";
import SourceCard from "./SourceCard";

import { useListSourcesQuery } from "services/api/api";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    flexGrow: 1,
    paddingBlock: theme.spacing(3),
  },
}));

const SourceGrid = () => {
  const classes = useStyles();
  const { isLoading, data } = useListSourcesQuery({});
  return (
    <Grid className={classes.gridContainer} container spacing={3}>
      {isLoading || !data ? (
        <CircularProgress />
      ) : (
        data.map((source) => (
          <Grid item key={source.id}>
            <SourceCard
              source={source}
              mappingCount={4}
              attributesCount={125}
            />
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default SourceGrid;
