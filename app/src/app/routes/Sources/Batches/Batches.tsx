import React from "react";

import { Container } from "@material-ui/core";

import BatchCreate from "features/Batches/BatchCreate";
import BatchList from "features/Batches/BatchList";
import Navbar from "features/Navbar/Navbar";

const Batches = (): JSX.Element => {
  return (
    <Container maxWidth="xl">
      <Navbar />
      <BatchCreate />
      <BatchList />
    </Container>
  );
};

export default Batches;
