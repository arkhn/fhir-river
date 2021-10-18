import { useState, useCallback } from "react";

import { isEqual } from "lodash";
import { useSnackbar } from "notistack";

import {
  useApiColumnsCreateMutation,
  useApiColumnsPartialUpdateMutation,
} from "services/api/endpoints";
import type { Column } from "services/api/generated/api.generated";

type UseColumnProps = {
  /**
   * Initial column value
   */
  initialColumn?: Partial<Column>;
  /**
   * Specifies if the object already exists in the backend
   */
  exists?: boolean;
};

/**
 * Hook handling pending columns the same way a classic useState hook would.
 * It supports back column creation & updates.
 * @returns A tuple with the pending column stored in state & an onChange function
 */
const useColumn = ({
  initialColumn,
  exists,
}: UseColumnProps): [
  column: Partial<Column> | undefined,
  onChange: (column: Partial<Column>) => void
] => {
  const { enqueueSnackbar } = useSnackbar();
  const [column, setColumn] = useState<Partial<Column> | undefined>(
    initialColumn
  );

  const [createColumn] = useApiColumnsCreateMutation();
  const [partialUpdateColumn] = useApiColumnsPartialUpdateMutation();

  const onChange = useCallback(
    async (changedColumn: Partial<Column>) => {
      const isColumnPartial =
        !changedColumn.owner || !changedColumn.table || !changedColumn.column;
      if (
        (!exists || column) &&
        !isColumnPartial &&
        !isEqual(changedColumn, column)
      ) {
        try {
          const apiColumn = changedColumn.id
            ? await partialUpdateColumn({
                id: changedColumn.id,
                patchedColumnRequest: changedColumn,
              }).unwrap()
            : await createColumn({
                columnRequest: changedColumn as Column,
              }).unwrap();
          setColumn(apiColumn);
        } catch (e) {
          enqueueSnackbar(e.error, { variant: "error" });
        }
      } else setColumn(changedColumn);
    },
    [column, createColumn, enqueueSnackbar, exists, partialUpdateColumn]
  );

  return [column, onChange];
};

export default useColumn;
