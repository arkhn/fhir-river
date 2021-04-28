import React from "react";

import { CircularProgress } from "@material-ui/core";
import { useParams } from "react-router-dom";

import TableStep from "features/Mappings/TableStep";
import { useApiResourcesRetrieveQuery } from "services/api/generated/api.generated";

const EditMapping = (): JSX.Element => {
  const { mappingId } = useParams<{
    mappingId?: string;
  }>();
  const {
    data: mapping,
    isLoading: isMappingLoading,
  } = useApiResourcesRetrieveQuery(
    {
      id: mappingId ?? "",
    },
    { skip: !mappingId }
  );
  return isMappingLoading ? (
    <CircularProgress />
  ) : (
    <> {mapping && <TableStep mapping={mapping} />}</>
  );
};

export default EditMapping;
