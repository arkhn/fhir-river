import React from "react";

import { CircularProgress, Grid, makeStyles } from "@material-ui/core";
import SourceCard from "./SourceCard";

import { useListSourcesQuery } from "services/api/api";
import { Source } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    flexGrow: 1,
    paddingBlock: theme.spacing(3),
  },
}));

type SourceGridProps = {
  editSource: (source: Source) => void;
};

const SourceGrid = ({ editSource }: SourceGridProps) => {
  const classes = useStyles();
  const { isLoading, data: sources } = useListSourcesQuery({});

  return (
    <Grid className={classes.gridContainer} container spacing={3}>
      {isLoading ? (
        <CircularProgress />
      ) : (
        sources?.map((source) => (
          <Grid item key={source.id}>
            <SourceCard source={source} editSource={editSource} />
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default SourceGrid;
