import { useState, useCallback } from "react";

import { isEqual } from "lodash";
import { useSnackbar } from "notistack";

import {
  useApiConditionsCreateMutation,
  useApiConditionsPartialUpdateMutation,
} from "services/api/endpoints";
import type { Condition } from "services/api/generated/api.generated";

type UseConditionProps = {
  /**
   * Initial condition value
   */
  initialCondition?: Partial<Condition>;
  /**
   * Specifies if the object already exists in the backend
   */
  exists?: boolean;
};

/**
 * Hook handling pending conditions the same way a classic useState hook would.
 * It supports back condition creation & updates.
 * @returns A tuple with the pending condition stored in state & an onChange function
 */
const useCondition = ({
  initialCondition,
  exists,
}: UseConditionProps): [
  condition: Partial<Condition> | undefined,
  onChange: (condition: Partial<Condition>) => void
] => {
  const { enqueueSnackbar } = useSnackbar();
  const [condition, setCondition] = useState<Partial<Condition> | undefined>(
    initialCondition
  );

  const [createCondition] = useApiConditionsCreateMutation();
  const [partialUpdateCondition] = useApiConditionsPartialUpdateMutation();

  const onChange = useCallback(
    async (changedCondition: Partial<Condition>) => {
      const isConditionPartial =
        !changedCondition.action ||
        !changedCondition.sql_input ||
        !changedCondition.relation ||
        !changedCondition.input_group;
      if (
        (!exists || condition) &&
        !isConditionPartial &&
        !isEqual(changedCondition, condition)
      ) {
        try {
          const apiCondition = changedCondition.id
            ? await partialUpdateCondition({
                id: changedCondition.id,
                patchedConditionRequest: changedCondition,
              }).unwrap()
            : await createCondition({
                conditionRequest: changedCondition as Condition,
              }).unwrap();
          setCondition(apiCondition);
        } catch (e) {
          enqueueSnackbar(e.error, { variant: "error" });
        }
      } else setCondition(changedCondition);
    },
    [
      exists,
      condition,
      partialUpdateCondition,
      createCondition,
      enqueueSnackbar,
    ]
  );

  return [condition, onChange];
};

export default useCondition;
