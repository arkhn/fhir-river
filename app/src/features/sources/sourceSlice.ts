import { createSlice, createAction } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type {
  Source,
  SourceRequest,
} from "services/api/generated/api.generated";

type SourceSliceState = {
  sourceToCreate?: SourceRequest;
  sourceToUpdate?: Source;
};

const initialState: SourceSliceState = {};

export const createSource = createAction<SourceRequest>("create");
export const updateSource = createAction<Source>("update");

const sourceSlice = createSlice({
  name: "source",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createSource, (state, { payload }) => {
      state.sourceToCreate = payload;
    });
    builder.addCase(updateSource, (state, { payload }) => {
      state.sourceToUpdate = payload;
    });
  },
});

export const selectSourceToCreate = (
  state: RootState
): SourceRequest | undefined => state.source.sourceToCreate;
export const selectSourceToUpdate = (state: RootState): Source | undefined =>
  state.source.sourceToUpdate;

export default sourceSlice.reducer;
