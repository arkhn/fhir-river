import React from "react";

import { Container } from "@material-ui/core";

import BatchCreate from "features/Batches/BatchCreate";
import BatchList from "features/Batches/BatchList";
import NavigationBreadcrumbs from "features/NavigationBreadcrumbs/NavigationBreadcrumbs";

const Batches = (): JSX.Element => {
  return (
    <Container maxWidth="xl">
      <NavigationBreadcrumbs />
      <BatchCreate />
      <BatchList />
    </Container>
  );
};

export default Batches;
