import { useMemo } from "react";

import { useParams } from "react-router-dom";

import { useAppSelector } from "app/store";
import {
  ElementNode,
  selectRootElementNode,
} from "features/FhirResourceTree/resourceTreeSlice";
import { getNode } from "features/FhirResourceTree/resourceTreeUtils";
import { useApiAttributesRetrieveQuery } from "services/api/endpoints";

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
      return getNode("path", selectedAttribute.path, rootElementNode);
    }
  }, [selectedAttribute, rootElementNode, isSelectedAttributeUninitialized]);
  return selectedNode;
  return;
};

export default useGetSelectedNode;
