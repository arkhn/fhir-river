import { useState, useCallback } from "react";

import { isEqual } from "lodash";

import {
  useApiConditionsCreateMutation,
  useApiConditionsPartialUpdateMutation,
} from "services/api/endpoints";
import type { Condition } from "services/api/generated/api.generated";

type UseConditionProps = Partial<Condition> | undefined;

const useCondition = (
  initialCondition: UseConditionProps
): [
  condition: Partial<Condition> | undefined,
  onChange: (condition: Partial<Condition>) => void
] => {
  const [condition, setCondition] = useState<Partial<Condition> | undefined>(
    initialCondition
  );

  const [createCondition] = useApiConditionsCreateMutation();
  const [partialUpdateCondition] = useApiConditionsPartialUpdateMutation();

  const onChange = useCallback(
    async (_condition: Partial<Condition>) => {
      const isConditionPartial =
        !_condition.action || !_condition.sql_input || !_condition.input_group;
      if (condition && !isConditionPartial && !isEqual(_condition, condition)) {
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
          // TODO: use snackbar
          console.error(e);
        }
      } else setCondition(_condition);
    },
    [condition, createCondition, partialUpdateCondition]
  );

  return [condition, onChange];
};

export default useCondition;
