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
    resourcesAdded: resourceAdapter.addMany,
    resourceUpdated: resourceAdapter.updateOne,
    resourcesUpdated: resourceAdapter.updateMany,
    resourceUpserted: resourceAdapter.upsertOne,
    resourcesUpserted: resourceAdapter.upsertMany,
  },
});

export const {
  initResource,
  resourceAdded,
  resourcesAdded,
  resourceUpdated,
  resourcesUpdated,
  resourceUpserted,
  resourcesUpserted,
} = resourceSlice.actions;

export const resourceSelectors = resourceAdapter.getSelectors<RootState>(
  (state) => state.resource
);

export default resourceSlice.reducer;
