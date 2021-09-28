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
    async (_column: Partial<Column>) => {
      const isColumnPartial =
        !_column.owner || !_column.table || !_column.column;
      if (
        (!exists || column) &&
        !isColumnPartial &&
        !isEqual(_column, column)
      ) {
        try {
          const column_ = _column.id
            ? await partialUpdateColumn({
                id: _column.id,
                patchedColumnRequest: _column,
              }).unwrap()
            : await createColumn({ columnRequest: _column as Column }).unwrap();
          setColumn(column_);
        } catch (e) {
          enqueueSnackbar(e.error, { variant: "error" });
        }
      } else setColumn(_column);
    },
    [column, createColumn, enqueueSnackbar, exists, partialUpdateColumn]
  );

  return [column, onChange];
};

export default useColumn;
