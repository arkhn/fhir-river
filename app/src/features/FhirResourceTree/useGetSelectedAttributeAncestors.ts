import { useMemo } from "react";

import { useParams } from "react-router";

import { useApiAttributesRetrieveQuery } from "services/api/endpoints";

import { computePathWithoutIndexes } from "./resourceTreeUtils";

/**
 * `Observation.code.coding[0].type` => `[Observation.code, Observation.code.coding, Observation.code.coding[0]]`
 * @param path Path to decompose
 * @returns Ancestors paths
 */
const getAncestorsPaths = (path: string): string[] => {
  return path.split(".").reduce((acc: string[], val, index, array) => {
    const decomposedValuePath =
      computePathWithoutIndexes(val) !== val
        ? [computePathWithoutIndexes(val), val]
        : [val];
    if (index === 0) return [];
    if (index === 1) {
      return decomposedValuePath.map((_val) => `${array[0]}.${_val}`);
    } else {
      return [
        ...acc,
        ...decomposedValuePath.map((_val) => `${acc[acc.length - 1]}.${_val}`),
      ];
    }
  }, []);
};

const useGetSelectedAttributeAncestors = (): string[] => {
  const { attributeId } = useParams<{
    attributeId?: string;
  }>();
  const { data: selectedAttribute } = useApiAttributesRetrieveQuery(
    { id: attributeId ?? "" },
    { skip: !attributeId }
  );

  return useMemo(() => {
    if (selectedAttribute) return getAncestorsPaths(selectedAttribute.path);
    return [];
  }, [selectedAttribute]);
};

export default useGetSelectedAttributeAncestors;
