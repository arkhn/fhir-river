import React from "react";

import { Container } from "@material-ui/core";

import BatchCreate from "features/Batches/BatchCreate";
import BatchList from "features/Batches/BatchList";

const Batches = (): JSX.Element => {
  return (
    <Container maxWidth="xl">
      <BatchCreate />
      <BatchList />
    </Container>
  );
};

export default Batches;
