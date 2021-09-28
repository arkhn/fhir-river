import { useState, useCallback } from "react";

import { isEqual } from "lodash";

import {
  useApiSqlInputsCreateMutation,
  useApiSqlInputsPartialUpdateMutation,
} from "services/api/endpoints";
import type { SQLInput } from "services/api/generated/api.generated";

type UseSqlInputProps = {
  /**
   * Initial join value
   */
  initialSqlInput?: Partial<SQLInput>;
  /**
   * Specifies if the object already exists in the backend
   */
  exists?: boolean;
};

const useSqlInput = ({
  initialSqlInput,
  exists,
}: UseSqlInputProps): [
  sqlInput: Partial<SQLInput> | undefined,
  onChange: (sqlInput: Partial<SQLInput>) => void
] => {
  const [sqlInput, setSqlInput] = useState<Partial<SQLInput> | undefined>(
    initialSqlInput
  );

  const [createSqlInput] = useApiSqlInputsCreateMutation();
  const [partialUpdateSqlInput] = useApiSqlInputsPartialUpdateMutation();

  const onChange = useCallback(
    async (changedSqlInput: Partial<SQLInput>) => {
      const isSqlInputPartial = !changedSqlInput.column;
      if (
        (!exists || sqlInput) &&
        !isSqlInputPartial &&
        !isEqual(changedSqlInput, sqlInput)
      ) {
        try {
          const sqlInput_ = changedSqlInput.id
            ? await partialUpdateSqlInput({
                id: changedSqlInput.id,
                patchedSqlInputRequest: changedSqlInput,
              }).unwrap()
            : await createSqlInput({
                sqlInputRequest: changedSqlInput as SQLInput,
              }).unwrap();
          setSqlInput(sqlInput_);
        } catch (e) {
          // TODO: use snackbar
          console.error(e);
        }
      } else setSqlInput(changedSqlInput);
    },
    [createSqlInput, exists, partialUpdateSqlInput, sqlInput]
  );

  return [sqlInput, onChange];
};

export default useSqlInput;
