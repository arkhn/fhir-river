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
    async (_condition: Partial<Condition>) => {
      const isConditionPartial =
        !_condition.action || !_condition.sql_input || !_condition.input_group;
      if (
        (!exists || condition) &&
        !isConditionPartial &&
        !isEqual(_condition, condition)
      ) {
        try {
          const condition_ = _condition.id
            ? await partialUpdateCondition({
                id: _condition.id,
                patchedConditionRequest: _condition,
              }).unwrap()
            : await createCondition({
                conditionRequest: _condition as Condition,
              }).unwrap();
          setCondition(condition_);
        } catch (e) {
          enqueueSnackbar(e.error, { variant: "error" });
        }
      } else setCondition(_condition);
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
