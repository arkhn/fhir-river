import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { StaticInput } from "services/api/generated/api.generated";

export type PendingstaticInput = Partial<StaticInput> & { pending?: boolean };

const staticInputAdapter = createEntityAdapter<PendingstaticInput>();

const staticInputSlice = createSlice({
  name: "staticInput",
  initialState: staticInputAdapter.getInitialState(),
  reducers: {
    staticInputAdded: staticInputAdapter.addOne,
    staticInputsAdded: staticInputAdapter.addMany,
    staticInputUpdated: staticInputAdapter.updateOne,
    staticInputRemoved: staticInputAdapter.removeOne,
    staticInputsRemoved: staticInputAdapter.removeAll,
  },
});

export const {
  staticInputAdded,
  staticInputsAdded,
  staticInputUpdated,
  staticInputRemoved,
  staticInputsRemoved,
} = staticInputSlice.actions;

export const staticInputSelectors = staticInputAdapter.getSelectors<RootState>(
  (state) => state.staticInput
);

export default staticInputSlice.reducer;
