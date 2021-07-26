import { useAppSelector } from "app/store";
import {
  ElementNode,
  selectRoot,
} from "features/FhirResourceTree/resourceTreeSlice";
import { getParent } from "features/FhirResourceTree/resourceTreeUtils";

const useIsNodeReferenceSystemURI = (node?: ElementNode): boolean => {
  const root = useAppSelector(selectRoot);

  if (!root || !node || node.type !== "uri" || node.name !== "system") {
    return false;
  }

  const parentNode = getParent(node, root);
  if (!parentNode || parentNode.type !== "Identifier") {
    return false;
  }

  const greatParentNode = getParent(parentNode, root);
  return greatParentNode?.type === "Reference";
};

export default useIsNodeReferenceSystemURI;
