import React from "react";

import { Container } from "@material-ui/core";
import { useParams } from "react-router";

import MappingsTable from "features/mappings/MappingsTable";
import SourceBreadcrumbs from "features/sources/SourceBreadcrumbs";

const SourceMappings = () => {
  const { sourceId } = useParams<{ sourceId: string }>();

  return (
    <Container maxWidth="xl">
      <SourceBreadcrumbs source={source} />
      <Container maxWidth="xl">
        <MappingsTable source={source} />
      </Container>
    </Container>
  );
};

export default SourceMappings;
