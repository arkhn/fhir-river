import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Resource } from "services/api/generated/api.generated";

const resourceAdapter = createEntityAdapter<Partial<Resource>>();

const resourceSlice = createSlice({
  name: "resource",
  initialState: resourceAdapter.getInitialState(),
  reducers: {
    resourceAdded: resourceAdapter.addOne,
    resourcesAdded: resourceAdapter.addMany,
    resourceUpdated: resourceAdapter.updateOne,
    resourcesUpdated: resourceAdapter.updateMany,
  },
});

export const {
  resourceAdded,
  resourcesAdded,
  resourceUpdated,
  resourcesUpdated,
} = resourceSlice.actions;

export const resourceSelectors = resourceAdapter.getSelectors<RootState>(
  (state) => state.resource
);

export default resourceSlice.reducer;
