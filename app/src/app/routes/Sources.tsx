import React from "react";

import { Container, Grid, makeStyles } from "@material-ui/core";

import SourceCreate from "features/sources/SourceCreate";
import SourceDrawer from "features/sources/SourceDrawer";
import SourceGrid from "features/sources/SourceGrid";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    flexGrow: 1,
    paddingTop: theme.spacing(5),
  },
}));

const Sources = (): JSX.Element => {
  const classes = useStyles();

  return (
    <Container maxWidth="xl">
      <Grid className={classes.gridContainer} spacing={3} container>
        <SourceCreate />
      </Grid>
      <SourceGrid />
      <SourceDrawer />
    </Container>
  );
};

export default Sources;
