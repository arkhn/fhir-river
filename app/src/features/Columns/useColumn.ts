import { useState, useCallback } from "react";

import { isEqual } from "lodash";

import {
  useApiColumnsCreateMutation,
  useApiColumnsPartialUpdateMutation,
} from "services/api/endpoints";
import type { Column } from "services/api/generated/api.generated";

type UseColumnProps = Partial<Column> | undefined;

const useColumn = (
  initialColumn: UseColumnProps
): [
  column: Partial<Column> | undefined,
  onChange: (column: Partial<Column>) => void
] => {
  const [column, setColumn] = useState<Partial<Column> | undefined>(
    initialColumn
  );

  const [createColumn] = useApiColumnsCreateMutation();
  const [partialUpdateColumn] = useApiColumnsPartialUpdateMutation();

  const onChange = useCallback(
    async (_column: Partial<Column>) => {
      const isColumnPartial =
        !_column.owner || !_column.table || !_column.column;
      if (column && !isColumnPartial && !isEqual(_column, column)) {
        try {
          const column_ = _column.id
            ? await partialUpdateColumn({
                id: _column.id,
                patchedColumnRequest: _column,
              }).unwrap()
            : await createColumn({ columnRequest: _column as Column }).unwrap();
          setColumn(column_);
        } catch (e) {
          // TODO: use snackbar
          console.error(e);
        }
      } else setColumn(_column);
    },
    [column, createColumn, partialUpdateColumn]
  );

  return [column, onChange];
};

export default useColumn;
