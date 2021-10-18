import { useParams } from "react-router";

import { ElementNode } from "features/FhirResourceTree/resourceTreeSlice";
import { computePathWithoutIndexes } from "features/FhirResourceTree/resourceTreeUtils";
import { useApiAttributesListQuery } from "services/api/endpoints";
import { Attribute } from "services/api/generated/api.generated";

/**
 * Retrieve all attributes which are direct children of `elementNode`
 * @param elementNode
 */
const useGetNodeItemAttributes = (
  elementNode: ElementNode
): Attribute[] | undefined => {
  const { mappingId } = useParams<{ mappingId?: string }>();
  const { data: nodeChildItemAttributes } = useApiAttributesListQuery(
    { resource: mappingId },
    {
      skip: !mappingId || !elementNode.isArray,
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.filter(
          (attribute) =>
            computePathWithoutIndexes(attribute.path) === elementNode.path
        ),
      }),
    }
  );

  return nodeChildItemAttributes;
};

export default useGetNodeItemAttributes;
