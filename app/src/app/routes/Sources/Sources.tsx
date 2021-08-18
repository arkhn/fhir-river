import React from "react";

import { Container, makeStyles } from "@material-ui/core";

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
  container: {
    padding: theme.spacing(5, 8),
  },
}));

const Sources = (): JSX.Element => {
  const classes = useStyles();

  return (
    <Container maxWidth="xl" className={classes.container}>
      <SourceCreate className={classes.button} />
      <SourceGrid />
      <SourceDrawer />
    </Container>
  );
};

export default Sources;
