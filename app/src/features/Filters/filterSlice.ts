import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Filter } from "services/api/generated/api.generated";

const filterAdapter = createEntityAdapter<Partial<Filter>>();

const filterSlice = createSlice({
  name: "filter",
  initialState: filterAdapter.getInitialState(),
  reducers: {
    filterAdded: filterAdapter.addOne,
    filterUpdated: filterAdapter.updateOne,
    filtersRemoved: filterAdapter.removeAll,
  },
});

export const {
  filterAdded,
  filterUpdated,
  filtersRemoved,
} = filterSlice.actions;

export const filterSelectors = filterAdapter.getSelectors<RootState>(
  (state) => state.filter
);

export default filterSlice.reducer;
