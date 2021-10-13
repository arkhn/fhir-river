import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { SqlInput } from "services/api/generated/api.generated";

export type PendingSqlInput = Partial<SqlInput> & { pending?: boolean };

const sqlInputAdapter = createEntityAdapter<PendingSqlInput>();

const sqlInputSlice = createSlice({
  name: "sqlInput",
  initialState: sqlInputAdapter.getInitialState(),
  reducers: {
    sqlInputAdded: sqlInputAdapter.addOne,
    sqlInputsAdded: sqlInputAdapter.addMany,
    sqlInputUpdated: sqlInputAdapter.updateOne,
    sqlInputRemoved: sqlInputAdapter.removeOne,
    sqlInputsRemoved: sqlInputAdapter.removeAll,
  },
});

export const {
  sqlInputAdded,
  sqlInputsAdded,
  sqlInputUpdated,
  sqlInputRemoved,
  sqlInputsRemoved,
} = sqlInputSlice.actions;

export const sqlInputSelectors = sqlInputAdapter.getSelectors<RootState>(
  (state) => state.sqlInput
);

export default sqlInputSlice.reducer;
