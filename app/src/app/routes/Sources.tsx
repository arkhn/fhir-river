import React from "react";

import { Container, Grid, makeStyles } from "@material-ui/core";

import SourceCreate from "features/sources/SourceCreate";
import SourceGrid from "features/sources/SourceGrid";

import Drawer from "./SourceDrawer";

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
      <Drawer />
    </Container>
  );
};

export default Sources;
