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
  SQLInput,
  StaticInput,
} from "services/api/generated/api.generated";

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

  const inputs: (SQLInput | StaticInput)[] | undefined = useMemo(() => {
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
        attribute.path === node.path || attribute.path.startsWith(node.path)
    )
  );
};

export default useIsNodePending;
