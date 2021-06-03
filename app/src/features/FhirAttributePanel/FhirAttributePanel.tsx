import React from "react";

import { useAppSelector } from "app/store";
import { selectSelectedNode } from "features/FhirResourceTree/resourceTreeSlice";
import { useApiAttributesListQuery } from "services/api/endpoints";

const FhirAttributePanel = (): JSX.Element => {
  const selectedNode = useAppSelector(selectSelectedNode);
  const { data } = useApiAttributesListQuery(
    { path: selectedNode?.path ?? "" },
    { skip: !selectedNode }
  );
  console.log(selectedNode);
  console.log(data?.[0]);
  return <></>;
};

export default FhirAttributePanel;
