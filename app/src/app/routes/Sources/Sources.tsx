import React from "react";

import { Container, Grid, makeStyles } from "@material-ui/core";

import SourceCreate from "features/Sources/SourceCreate";
import SourceDrawer from "features/Sources/SourceDrawer";
import SourceGrid from "features/Sources/SourceGrid";

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
  },
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
        <SourceCreate className={classes.button} />
      </Grid>
      <SourceGrid />
      <SourceDrawer />
    </Container>
  );
};

export default Sources;
