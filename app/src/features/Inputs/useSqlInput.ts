import { useState, useCallback } from "react";

import { isEqual } from "lodash";

import {
  useApiSqlInputsCreateMutation,
  useApiSqlInputsPartialUpdateMutation,
} from "services/api/endpoints";
import type { SQLInput } from "services/api/generated/api.generated";

type UseSqlInputProps = {
  initialSqlInput?: Partial<SQLInput>;
  hasRetrieveStarted?: boolean;
};

const useSqlInput = ({
  initialSqlInput,
  hasRetrieveStarted,
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
        (!hasRetrieveStarted || sqlInput) &&
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
    [createSqlInput, hasRetrieveStarted, partialUpdateSqlInput, sqlInput]
  );

  return [sqlInput, onChange];
};

export default useSqlInput;
