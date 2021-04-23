import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import { Filter } from "services/api/generated/api.generated";

const filtersAdapter = createEntityAdapter<Partial<Filter>>();

const filtersSlice = createSlice({
  name: "filters",
  initialState: filtersAdapter.getInitialState(),
  reducers: {
    filterAdded: filtersAdapter.addOne,
    filtersAdded: filtersAdapter.addMany,
    filterUpdated: filtersAdapter.updateOne,
    filtersUpdated: filtersAdapter.updateMany,
  },
});

export default filtersSlice.reducer;
