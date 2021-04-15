import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "app/store";
import { Filter, Resource } from "services/api/generated/api.generated";

type MappingState = {
  current?: Partial<Resource>;
  filters?: Filter[];
};

const initialState: MappingState = {};

const mappingSlice = createSlice({
  name: "mapping",
  initialState,
  reducers: {
    resetMappingCreation: () => initialState,
    initMappingCreation: (state, _: PayloadAction<void>) => {
      state.current = {};
      state.filters = [];
    },
    updateMapping: (state, { payload }: PayloadAction<Partial<Resource>>) => {
      state.current = { ...state.current, ...payload };
    },
  },
});

export const selectMappingCurrent = (
  state: RootState
): Partial<Resource> | undefined => state.mapping.current;

export default mappingSlice.reducer;
export const {
  resetMappingCreation,
  initMappingCreation,
  updateMapping,
} = mappingSlice.actions;
