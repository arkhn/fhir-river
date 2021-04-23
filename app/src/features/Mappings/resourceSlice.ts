import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Resource } from "services/api/generated/api.generated";

const resourceAdapter = createEntityAdapter<Partial<Resource>>();

const initialState = resourceAdapter.getInitialState();

const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {
    initResource: () => initialState,
    resourceAdded: resourceAdapter.addOne,
    resourceUpdated: resourceAdapter.updateOne,
  },
});

export const {
  initResource,
  resourceAdded,
  resourceUpdated,
} = resourceSlice.actions;

export const resourceSelectors = resourceAdapter.getSelectors<RootState>(
  (state) => state.resource
);

export default resourceSlice.reducer;
