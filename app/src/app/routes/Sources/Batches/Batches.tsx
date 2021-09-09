import React from "react";

import { Container } from "@material-ui/core";

import BatchList from "features/Batches/BatchList";
import Navbar from "features/Navbar/Navbar";

import BatchCreate from "./BatchCreate";

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
