import React from "react";

import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import BatchCreate from "app/routes/Sources/Batches/BatchCreate";
import BatchList from "features/Batches/BatchList";
import Navbar from "features/Navbar/Navbar";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
}));

const Batches = (): JSX.Element => {
  const classes = useStyles();
  return (
    <Container maxWidth="xl" className={classes.root}>
      <Navbar />
      <BatchCreate />
      <BatchList />
    </Container>
  );
};

export default Batches;
