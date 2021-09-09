import React from "react";

import { Container, makeStyles } from "@material-ui/core";

import SourceCreate from "features/Sources/SourceCreate";
import SourceDrawer from "features/Sources/SourceDrawer";
import SourceGrid from "features/Sources/SourceGrid";
import UploadSourceButton from "features/Sources/UploadSourceButton";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    flexGrow: 1,
    paddingTop: theme.spacing(2),
  },
  container: {
    padding: theme.spacing(5, 8),
  },
}));

const Sources = (): JSX.Element => {
  const classes = useStyles();

  return (
    <Container maxWidth="xl" className={classes.container}>
      <SourceCreate />
      <UploadSourceButton />
      <SourceGrid />
      <SourceDrawer />
    </Container>
  );
};

export default Sources;
