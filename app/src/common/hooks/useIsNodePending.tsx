import { useParams } from "react-router";

import { ElementNode } from "features/FhirResourceTree/resourceTreeSlice";
import {
  useApiAttributesListQuery,
  useApiInputGroupsListQuery,
} from "services/api/endpoints";

const useIsNodePending = (node: ElementNode): boolean => {
  const { mappingId } = useParams<{ mappingId?: string }>();

  const { data: nodeAttributes } = useApiAttributesListQuery(
    {
      resource: mappingId ?? "",
      path: node.path,
    },
    { skip: !mappingId }
  );
  const nodeAttribute = nodeAttributes?.[0];
  const { data: inputGroups } = useApiInputGroupsListQuery(
    { attribute: nodeAttribute?.id ?? "" },
    { skip: !nodeAttribute }
  );

  return inputGroups !== undefined && inputGroups.length > 0;
};

export default useIsNodePending;
