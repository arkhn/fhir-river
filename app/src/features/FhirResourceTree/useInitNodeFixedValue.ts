import { useMemo, useEffect } from "react";

import { useParams } from "react-router";

import {
  useApiAttributesCreateMutation,
  useApiInputGroupsCreateMutation,
  useApiStaticInputsCreateMutation,
  useApiAttributesListQuery,
  useApiInputGroupsListQuery,
  useApiStaticInputsListQuery,
} from "services/api/endpoints";

import { ElementNode } from "./resourceTreeSlice";

// if the node has a fixed value, creates an attribute with an input group
// with a static input inside
const useInitNodeFixedValue = (node?: ElementNode): void => {
  const { mappingId } = useParams<{
    mappingId?: string;
  }>();
  const primitiveFixedValue: string | undefined = useMemo(() => {
    if (node && node.kind === "primitive") {
      return Object.entries(node.definitionNode.definition)
        ?.find(([key]) => key.startsWith("fixed"))?.[1]
        .toString();
    }
  }, [node]);

  const {
    data: nodeAttributes,
    isLoading: isNodeAttributesLoading,
    isUninitialized: isNodeAttributesUninitialized,
  } = useApiAttributesListQuery(
    {
      resource: mappingId,
      path: node?.path,
    },
    { skip: !node || !primitiveFixedValue }
  );
  const nodeAttribute = nodeAttributes?.[0];

  const {
    data: inputGroups,
    isLoading: isInputGroupsLoading,
    isUninitialized: isInputGroupsUninitialized,
  } = useApiInputGroupsListQuery(
    { attribute: nodeAttribute?.id },
    { skip: !nodeAttribute }
  );
  const {
    data: staticInputs,
    isLoading: isStaticInputsLoading,
    isUninitialized: isStaticInputsUninitialized,
    refetch: refetchStaticInputs,
  } = useApiStaticInputsListQuery(
    { attribute: nodeAttribute?.id },
    { skip: !nodeAttribute }
  );

  const isLoading =
    isNodeAttributesLoading ||
    isNodeAttributesUninitialized ||
    isInputGroupsLoading ||
    isInputGroupsUninitialized ||
    isStaticInputsLoading ||
    isStaticInputsUninitialized;

  const isAttributeCreated =
    !isNodeAttributesLoading &&
    !isNodeAttributesUninitialized &&
    nodeAttribute !== undefined;

  const shouldCreateStaticInput = useMemo(
    () =>
      !isAttributeCreated ||
      (!isLoading &&
        staticInputs !== undefined &&
        !staticInputs.length &&
        inputGroups !== undefined &&
        !inputGroups.length),
    [inputGroups, isAttributeCreated, isLoading, staticInputs]
  );

  const [createAttribute] = useApiAttributesCreateMutation();
  const [createInputGroup] = useApiInputGroupsCreateMutation();
  const [createStaticInput] = useApiStaticInputsCreateMutation();

  // Refreshes staticInputs list when inputGroups list is empty
  // This purpose is to "invalidate" staticInputs when inputGroups are deleted
  useEffect(() => {
    if (
      !isInputGroupsLoading &&
      inputGroups &&
      !inputGroups.length &&
      !isStaticInputsLoading
    ) {
      refetchStaticInputs();
    }
  }, [
    inputGroups,
    isInputGroupsLoading,
    isStaticInputsLoading,
    refetchStaticInputs,
  ]);

  // if the attribute has a primitive fixed value and has no attributes,
  // creates an attribute, an input group, and a static input
  useEffect(() => {
    const createPrimitiveStaticInputWithFixedValue = async () => {
      if (
        primitiveFixedValue &&
        shouldCreateStaticInput &&
        mappingId &&
        node &&
        node.type
      ) {
        const attribute =
          nodeAttribute ||
          (await createAttribute({
            attributeRequest: {
              definition_id: node.type,
              path: node.path,
              resource: mappingId,
            },
          }).unwrap());
        const inputGroup =
          inputGroups?.[0] ||
          (await createInputGroup({
            inputGroupRequest: { attribute: attribute.id },
          }).unwrap());
        await createStaticInput({
          staticInputRequest: {
            input_group: inputGroup.id,
            value: primitiveFixedValue,
          },
        }).unwrap();
      }
    };

    createPrimitiveStaticInputWithFixedValue();
  }, [
    node,
    createAttribute,
    createInputGroup,
    createStaticInput,
    primitiveFixedValue,
    mappingId,
    shouldCreateStaticInput,
    nodeAttribute,
    inputGroups,
  ]);
};

export default useInitNodeFixedValue;
