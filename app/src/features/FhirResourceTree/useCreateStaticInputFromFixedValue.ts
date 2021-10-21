import {
  useApiAttributesCreateMutation,
  useApiInputGroupsCreateMutation,
  useApiStaticInputsCreateMutation,
} from "services/api/endpoints";

import { ElementNode } from "./resourceTreeSlice";

const useCreateStaticInputFromFixedValue = (params: {
  node?: ElementNode;
  mappingId?: string;
}): {
  createStaticInputWithFixedValue: () => Promise<void>;
} => {
  const { node, mappingId } = params;
  const [createAttribute] = useApiAttributesCreateMutation();
  const [createInputGroup] = useApiInputGroupsCreateMutation();
  const [createStaticInput] = useApiStaticInputsCreateMutation();

  const getFixedEntry = () => {
    if (node)
      return Object.entries(node.definitionNode.definition)?.find(([key]) =>
        key.startsWith("fixed")
      );
  };
  const fixedEntry = getFixedEntry();

  const createStaticInputWithFixedValue = async () => {
    if (
      node &&
      node.type &&
      mappingId &&
      fixedEntry &&
      node.kind === "primitive"
    ) {
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
          value: fixedEntry[1].toString(),
        },
      }).unwrap();
    }
  };

  return {
    createStaticInputWithFixedValue,
  };
};

export default useCreateStaticInputFromFixedValue;
