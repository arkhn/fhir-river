import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Join } from "services/api/generated/api.generated";

const joinAdapter = createEntityAdapter<Partial<Join>>();

const joinSlice = createSlice({
  name: "join",
  initialState: joinAdapter.getInitialState(),
  reducers: {
    joinAdded: joinAdapter.addOne,
    joinRemoved: joinAdapter.removeOne,
    joinsRemoved: joinAdapter.removeAll,
  },
});

export const { joinAdded, joinRemoved, joinsRemoved } = joinSlice.actions;

export const joinSelectors = joinAdapter.getSelectors<RootState>(
  (state) => state.join
);

export default joinSlice.reducer;
