import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Column } from "services/api/generated/api.generated";

const columnAdapter = createEntityAdapter<Partial<Column>>();

const columnSlice = createSlice({
  name: "column",
  initialState: columnAdapter.getInitialState(),
  reducers: {
    columnAdded: columnAdapter.addOne,
    columnUpdated: columnAdapter.updateOne,
    columnsRemoved: columnAdapter.removeAll,
  },
});

export const {
  columnAdded,
  columnUpdated,
  columnsRemoved,
} = columnSlice.actions;

export const columnSelectors = columnAdapter.getSelectors<RootState>(
  (state) => state.column
);

export const selectColumnById = (state: RootState) => (
  id: string
): Partial<Column> | undefined => columnSelectors.selectById(state, id);

export default columnSlice.reducer;
