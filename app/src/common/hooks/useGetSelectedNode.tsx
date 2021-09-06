import { useMemo } from "react";

import { useParams } from "react-router-dom";

import { useAppSelector } from "app/store";
import {
  ElementNode,
  selectRoot,
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
  const root = useAppSelector(selectRoot);

  const selectedNode = useMemo(() => {
    if (!isSelectedAttributeUninitialized && selectedAttribute && root) {
      return getNode("path", selectedAttribute.path, root);
    }
  }, [selectedAttribute, root, isSelectedAttributeUninitialized]);

  return selectedNode;
};

export default useGetSelectedNode;
