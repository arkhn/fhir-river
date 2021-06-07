import React from "react";

import { useAppSelector } from "app/store";
import { selectSelectedNode } from "features/FhirResourceTree/resourceTreeSlice";
import {
  useApiAttributesListQuery,
  useApiInputGroupsListQuery,
} from "services/api/endpoints";

import AttributeInputGroup from "./AttributeInputGroup";

const FhirAttributePanel = (): JSX.Element => {
  const selectedNode = useAppSelector(selectSelectedNode);
  const { data } = useApiAttributesListQuery(
    { path: selectedNode?.path ?? "" },
    { skip: !selectedNode }
  );
  const attribute = data?.[0];
  const { data: attribueInputGroups } = useApiInputGroupsListQuery(
    { attribute: attribute?.id ?? "" },
    { skip: !attribute }
  );

  return (
    <>
      {attribueInputGroups &&
        attribueInputGroups.map((inputGroup) => (
          <AttributeInputGroup key={inputGroup.id} inputGroup={inputGroup} />
        ))}
    </>
  );
};

export default FhirAttributePanel;
