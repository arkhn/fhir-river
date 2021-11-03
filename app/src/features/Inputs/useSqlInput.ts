import { useState, useCallback } from "react";

import { isEqual } from "lodash";

import {
  useApiSqlInputsCreateMutation,
  useApiSqlInputsPartialUpdateMutation,
} from "services/api/endpoints";
import type { SqlInput } from "services/api/generated/api.generated";

type UseSqlInputProps = {
  /**
   * Initial join value
   */
  initialSqlInput?: Partial<SqlInput>;
  /**
   * Specifies if the object already exists in the backend
   */
  exists?: boolean;
};

/**
 * Hook handling pending sqlInputs the same way a classic useState hook would.
 * It supports back sqlInput creation & updates.
 * @returns A tuple with the pending sqlInput stored in state & an onChange function
 */
const useSqlInput = ({
  initialSqlInput,
  exists,
}: UseSqlInputProps): [
  sqlInput: Partial<SqlInput> | undefined,
  onChange: (sqlInput: Partial<SqlInput>) => void
] => {
  const [sqlInput, setSqlInput] = useState<Partial<SqlInput> | undefined>(
    initialSqlInput
  );

  const [createSqlInput] = useApiSqlInputsCreateMutation();
  const [partialUpdateSqlInput] = useApiSqlInputsPartialUpdateMutation();

  const onChange = useCallback(
    async (changedSqlInput: Partial<SqlInput>) => {
      const isSqlInputPartial = !changedSqlInput.column;
      if (
        (!exists || sqlInput) &&
        !isSqlInputPartial &&
        !isEqual(changedSqlInput, sqlInput)
      ) {
        const apiSqlInput = changedSqlInput.id
          ? await partialUpdateSqlInput({
              id: changedSqlInput.id,
              patchedSqlInputRequest: changedSqlInput,
            }).unwrap()
          : await createSqlInput({
              sqlInputRequest: changedSqlInput as SqlInput,
            }).unwrap();
        setSqlInput(apiSqlInput);
      } else setSqlInput(changedSqlInput);
    },
    [createSqlInput, exists, partialUpdateSqlInput, sqlInput]
  );

  return [sqlInput, onChange];
};

export default useSqlInput;
