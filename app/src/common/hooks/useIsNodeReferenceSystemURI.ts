import { useAppSelector } from "app/store";
import { selectRoot } from "features/FhirResourceTree/resourceTreeSlice";
import { getNode } from "features/FhirResourceTree/resourceTreeUtils";

import useGetSelectedNode from "./useGetSelectedNode";

const useIsNodeReferenceSystemURI = (): boolean => {
  const root = useAppSelector(selectRoot);
  const selectedNode = useGetSelectedNode();
  const isNodeTypeURIAndNameSystem =
    selectedNode?.type === "uri" && selectedNode?.name === "system";

  if (root && selectedNode && isNodeTypeURIAndNameSystem) {
    const parentNodePath = selectedNode.path.replace(/[.][^.]+$/, "");
    const parentNode = getNode("path", parentNodePath, root);

    const isParentNodeIdentifier = parentNode?.type === "Identifier";

    if (parentNode && isParentNodeIdentifier) {
      const greatParentNodePath = parentNode.path.replace(/[.][^.]+$/, "");
      const greatParentNode = getNode("path", greatParentNodePath, root);

      const isGreatParentNodeTypeReference =
        greatParentNode?.type === "Reference";

      return isGreatParentNodeTypeReference;
    }
  }

  return false;
};

export default useIsNodeReferenceSystemURI;
