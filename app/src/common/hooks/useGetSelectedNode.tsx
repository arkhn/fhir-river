import { useMemo } from "react";

import { useParams } from "react-router-dom";

import { useAppSelector } from "app/store";
import {
  ElementNode,
  selectRootElementNode,
} from "features/FhirResourceTree/resourceTreeSlice";
import { getElementNodeByPath } from "features/FhirResourceTree/resourceTreeUtils";
import { useApiAttributesRetrieveQuery } from "services/api/endpoints";

/**
 * @returns The ElementNode which path is the one affected to the attribute found from URL
 */
const useGetSelectedNode = (): ElementNode | undefined => {
  const { attributeId } = useParams<{
    attributeId?: string;
  }>();
  const {
    data: selectedAttribute,
    isUninitialized: isSelectedAttributeUninitialized,
  } = useApiAttributesRetrieveQuery(
    { id: attributeId ?? "" },
    { skip: !attributeId }
  );
  const rootElementNode = useAppSelector(selectRootElementNode);
  const selectedNode = useMemo(() => {
    if (
      !isSelectedAttributeUninitialized &&
      selectedAttribute &&
      rootElementNode
    ) {
      return getElementNodeByPath(selectedAttribute.path, rootElementNode);
    }
  }, [selectedAttribute, rootElementNode, isSelectedAttributeUninitialized]);
  return selectedNode;
};

export default useGetSelectedNode;
