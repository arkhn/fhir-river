import { createSlice, createAction } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Source } from "services/api/generated/api.generated";

type SourceSliceState = {
  toEdit?: Source | null;
};

const initialState: SourceSliceState = {};

export const editSource = createAction<Source | null | undefined>("edit");

const sourceSlice = createSlice({
  name: "source",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(editSource, (state, { payload }) => {
      state.toEdit = payload;
    });
  },
});

export const selectSourceToEdit = (
  state: RootState
): Source | null | undefined => state.source.toEdit;

export default sourceSlice.reducer;
