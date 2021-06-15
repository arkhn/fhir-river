import { useMemo } from "react";

import { useParams } from "react-router";

import { ElementNode } from "features/FhirResourceTree/resourceTreeSlice";
import {
  useApiAttributesListQuery,
  useApiInputGroupsListQuery,
} from "services/api/endpoints";

const useIsNodePending = (node: ElementNode): boolean => {
  const { mappingId } = useParams<{ mappingId?: string }>();

  const { data: attributes } = useApiAttributesListQuery(
    {
      resource: mappingId ?? "",
    },
    { skip: !mappingId }
  );
  const { data: inputGroups } = useApiInputGroupsListQuery(
    {},
    {
      skip: !attributes,
    }
  );

  const attributesWithInputGroups = useMemo(() => {
    if (attributes && inputGroups) {
      return attributes.filter((attribute) =>
        inputGroups.some((inputGroup) => inputGroup.attribute === attribute.id)
      );
    }
  }, [attributes, inputGroups]);

  return (
    attributesWithInputGroups !== undefined &&
    attributesWithInputGroups.some(
      (attribute) =>
        attribute.path === node.path || attribute.path.startsWith(node.path)
    )
  );
};

export default useIsNodePending;
