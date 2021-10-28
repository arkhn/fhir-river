import { useMemo, useEffect } from "react";

import { useSnackbar } from "notistack";
import { useParams } from "react-router";

import {
  useApiAttributesCreateMutation,
  useApiInputGroupsCreateMutation,
  useApiStaticInputsCreateMutation,
  useApiAttributesListQuery,
} from "services/api/endpoints";

import { ElementNode } from "./resourceTreeSlice";

// if the node has a fixed value, creates an attribute with an input group
// with a static input inside
const useInitNodeFixedValue = (node?: ElementNode): void => {
  const { mappingId } = useParams<{
    mappingId?: string;
  }>();
  const { enqueueSnackbar } = useSnackbar();
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
  } = useApiAttributesListQuery(
    {
      resource: mappingId,
      path: node?.path,
    },
    { skip: !node || !primitiveFixedValue }
  );

  const nodeAttribute = nodeAttributes?.[0];
  const [createAttribute] = useApiAttributesCreateMutation();
  const [createInputGroup] = useApiInputGroupsCreateMutation();
  const [createStaticInput] = useApiStaticInputsCreateMutation();

  const isNodeAttributeInitialized = !isNodeAttributesLoading && !nodeAttribute;

  // if the attribute has a primitive fixed value and has no attributes,
  // creates an attribute, an input group, and a static input
  useEffect(() => {
    const createPrimitiveStaticInputWithFixedValue = async () => {
      if (
        primitiveFixedValue &&
        isNodeAttributeInitialized &&
        mappingId &&
        node &&
        node.type
      ) {
        try {
          const attribute = await createAttribute({
            attributeRequest: {
              definition_id: node.type,
              path: node.path,
              resource: mappingId,
            },
          }).unwrap();
          const inputGroup = await createInputGroup({
            inputGroupRequest: { attribute: attribute.id },
          }).unwrap();
          await createStaticInput({
            staticInputRequest: {
              input_group: inputGroup.id,
              value: primitiveFixedValue,
            },
          }).unwrap();
        } catch (e) {
          enqueueSnackbar(e.error, { variant: "error" });
        }
      }
    };

    createPrimitiveStaticInputWithFixedValue();
  }, [
    isNodeAttributeInitialized,
    node,
    createAttribute,
    createInputGroup,
    createStaticInput,
    enqueueSnackbar,
    primitiveFixedValue,
    mappingId,
  ]);
};

export default useInitNodeFixedValue;
