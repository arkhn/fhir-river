import { useAppSelector } from "app/store";
import {
  ElementNode,
  selectRootElementNode,
} from "features/FhirResourceTree/resourceTreeSlice";
import { getParent } from "features/FhirResourceTree/resourceTreeUtils";

const useIsNodeReferenceSystemURI = (node?: ElementNode): boolean => {
  const rootElementNode = useAppSelector(selectRootElementNode);

  if (
    !rootElementNode ||
    !node ||
    node.type !== "uri" ||
    node.name !== "system"
  ) {
    return false;
  }

  const parentNode = getParent(node, rootElementNode);
  if (!parentNode || parentNode.type !== "Identifier") {
    return false;
  }

  const greatParentNode = getParent(parentNode, rootElementNode);
  return greatParentNode?.type === "Reference";
  return false;
};

export default useIsNodeReferenceSystemURI;
