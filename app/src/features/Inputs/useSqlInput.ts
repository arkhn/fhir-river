import { useState, useCallback } from "react";

import { isEqual } from "lodash";
import { useSnackbar } from "notistack";

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
  const { enqueueSnackbar } = useSnackbar();
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
          const apiSqlInput = changedSqlInput.id
            ? await partialUpdateSqlInput({
                id: changedSqlInput.id,
                patchedSqlInputRequest: changedSqlInput,
              }).unwrap()
            : await createSqlInput({
                sqlInputRequest: changedSqlInput as SQLInput,
              }).unwrap();
          setSqlInput(apiSqlInput);
        } catch (e) {
          enqueueSnackbar(e.error, { variant: "error" });
        }
      } else setSqlInput(changedSqlInput);
    },
    [createSqlInput, enqueueSnackbar, exists, partialUpdateSqlInput, sqlInput]
  );

  return [sqlInput, onChange];
};

export default useSqlInput;
