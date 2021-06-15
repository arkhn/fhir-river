import { useMemo } from "react";

import { useParams } from "react-router";

import { ElementNode } from "features/FhirResourceTree/resourceTreeSlice";
import {
  useApiAttributesListQuery,
  useApiInputGroupsListQuery,
  useApiInputsListQuery,
} from "services/api/endpoints";

const useIsNodePending = (node: ElementNode): boolean => {
  const { mappingId } = useParams<{ mappingId?: string }>();

  const { data: attributes } = useApiAttributesListQuery(
    {
      resource: mappingId ?? "",
    },
    { skip: !mappingId }
  );
  const { data: inputGroups } = useApiInputGroupsListQuery(
    {},
    {
      skip: !attributes,
    }
  );
  const { data: inputs } = useApiInputsListQuery({}, { skip: !inputGroups });

  const inputGroupsWithInputs = useMemo(() => {
    if (inputs && inputGroups) {
      return inputGroups.filter((inputGroup) =>
        inputs.some((input) => input.input_group === inputGroup.id)
      );
    }
  }, [inputs, inputGroups]);

  const attributesWithInputs = useMemo(() => {
    if (attributes && inputGroupsWithInputs) {
      return attributes.filter((attribute) =>
        inputGroupsWithInputs.some(
          (inputGroup) => inputGroup.attribute === attribute.id
        )
      );
    }
  }, [attributes, inputGroupsWithInputs]);

  return (
    attributesWithInputs !== undefined &&
    attributesWithInputs.some(
      (attribute) =>
        attribute.path === node.path || attribute.path.startsWith(node.path)
    )
  );
};

export default useIsNodePending;
