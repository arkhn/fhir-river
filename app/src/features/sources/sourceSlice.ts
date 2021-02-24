import { createSlice, createAction } from "@reduxjs/toolkit";

import type { RootState } from "../../app/store";
import type { Source } from "../../services/api/generated/api.generated";

const initialState = null as null | Source;

export const editSource = createAction<null | Source>("editSource");

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

export const selectSourceToEdit = (state: RootState) => state.source;

export default sourceSlice.reducer;
