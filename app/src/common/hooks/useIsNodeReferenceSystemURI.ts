import { useAppSelector } from "app/store";
import {
  ElementNode,
  selectRootElementNode,
} from "features/FhirResourceTree/resourceTreeSlice";
import { getParent } from "features/FhirResourceTree/resourceTreeUtils";

/**
 * @param node ElementNode to check
 * @returns Returns true if
 *    - node is of type `uri`
 *    - node is of name `system`
 *    - node parent is of type `Identifier`
 *    - node great parent of type `Reference`
 *
 *  Else returns false
 */
const useIsNodeReferenceSystemURI = (node?: ElementNode): boolean => {
  const rootElementNode = useAppSelector(selectRootElementNode);
  const nodeIsOfTypeUriAndNameSystem =
    node?.type === "uri" && node?.name === "system";

  if (!rootElementNode || !node || !nodeIsOfTypeUriAndNameSystem) {
    return false;
  }

  const parentNode = getParent(node, rootElementNode);
  if (parentNode?.type !== "Identifier") {
    return false;
  }

  const greatParentNode = getParent(parentNode, rootElementNode);
  return greatParentNode?.type === "Reference";
};

export default useIsNodeReferenceSystemURI;
