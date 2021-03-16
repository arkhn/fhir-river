import { createSlice, createAction } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Source } from "services/api/generated/api.generated";

const initialState = null as Source | null;

export const editSource = createAction<Source | null>("editSource");

const sourceSlice = createSlice({
  name: "source",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(editSource, (state, action) => {
      return action.payload;
    });
  },
});

export const selectSourceToEdit = (state: RootState): Source | null =>
  state.source;

export default sourceSlice.reducer;
