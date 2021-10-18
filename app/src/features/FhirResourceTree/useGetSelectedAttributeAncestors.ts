import { useMemo } from "react";

import { useParams } from "react-router";

import { useApiAttributesRetrieveQuery } from "services/api/endpoints";

import { getAncestorsPaths } from "./resourceTreeUtils";

const useGetSelectedAttributeAncestors = (): string[] => {
  const { attributeId } = useParams<{
    attributeId?: string;
  }>();
  const { data: selectedAttribute } = useApiAttributesRetrieveQuery(
    { id: attributeId ?? "" },
    { skip: !attributeId }
  );

  return useMemo(
    () => (selectedAttribute ? getAncestorsPaths(selectedAttribute.path) : []),
    [selectedAttribute]
  );
};

export default useGetSelectedAttributeAncestors;
