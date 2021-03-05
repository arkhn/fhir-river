import React from "react";

import { Container } from "@material-ui/core";

import MappingsTable from "features/mappings/MappingsTable";
import NavigationBreadcrumbs from "features/navigationBreadcrumbs/NavigationBreadcrumbs";

const SourceMappings = (): JSX.Element => {
  return (
    <Container maxWidth="xl">
      <NavigationBreadcrumbs />
      <Container maxWidth="xl">
        <MappingsTable />
      </Container>
    </Container>
  );
};

export default SourceMappings;
