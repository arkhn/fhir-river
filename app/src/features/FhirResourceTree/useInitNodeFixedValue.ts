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

  useEffect(() => {
    const createPrimitiveStaticInputWithFixedValue = async () => {
      if (
        primitiveFixedValue &&
        !isNodeAttributesLoading &&
        !nodeAttribute &&
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
    createAttribute,
    createInputGroup,
    createStaticInput,
    isNodeAttributesLoading,
    mappingId,
    node,
    nodeAttribute,
    primitiveFixedValue,
    enqueueSnackbar,
  ]);
};

export default useInitNodeFixedValue;
