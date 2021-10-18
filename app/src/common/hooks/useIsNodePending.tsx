import { useMemo } from "react";

import { useParams } from "react-router";

import type { ElementNode } from "features/FhirResourceTree/resourceTreeSlice";
import {
  useApiAttributesListQuery,
  useApiInputGroupsListQuery,
  useApiSqlInputsListQuery,
  useApiStaticInputsListQuery,
} from "services/api/endpoints";
import type {
  Attribute,
  SqlInput,
  StaticInput,
} from "services/api/generated/api.generated";

/**
 * Tests if node is a direct parent of attribute and if node kind is choice
 *
 * ie: returns true if
 * Node path => `Observation.effective[x]` & attribute path => `Observation.effectiveBoolean`
 * @param attribute The attribute that has an input
 * @param node The current node to be tested as the attribute ancestor
 * @returns True if node kind is "choice" and node is a parent of attribute
 */
const isAttributeChoiceOfNode = (
  attribute: Attribute,
  node: ElementNode
): boolean => {
  // Node kind has to be "choice"
  if (node.kind !== "choice") return false;

  const isNodeParentOfAttribute = node.children.some(
    ({ path }) => path === attribute.path
  );

  return isNodeParentOfAttribute;
};

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
  const { data: sqlInputs } = useApiSqlInputsListQuery(
    {},
    { skip: !inputGroups }
  );
  const { data: staticInputs } = useApiStaticInputsListQuery(
    {},
    { skip: !inputGroups }
  );

  const inputs: (SqlInput | StaticInput)[] | undefined = useMemo(() => {
    if (!sqlInputs) return staticInputs;
    if (!staticInputs) return sqlInputs;
    return [...sqlInputs, ...staticInputs];
  }, [sqlInputs, staticInputs]);

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
        attribute.path === node.path ||
        attribute.path.startsWith(node.path) ||
        isAttributeChoiceOfNode(attribute, node)
    )
  );
};

export default useIsNodePending;
