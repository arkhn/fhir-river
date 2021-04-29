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
    columnRemoved: columnAdapter.removeOne,
    columnsRemoved: columnAdapter.removeAll,
  },
});

export const {
  columnAdded,
  columnUpdated,
  columnRemoved,
  columnsRemoved,
} = columnSlice.actions;

export const columnSelectors = columnAdapter.getSelectors<RootState>(
  (state) => state.column
);

export default columnSlice.reducer;
