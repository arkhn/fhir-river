import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import { RootState } from "app/store";
import { Column, Filter, Resource } from "services/api/generated/api.generated";

export type FilterPending = Partial<Filter & { col: Partial<Column> }>;

type MappingState = {
  current?: Partial<Resource>;
  filters?: FilterPending[];
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
    addFilter: (state) => {
      if (state.filters) {
        state.filters = [...state.filters, { id: uuid() }];
      }
    },
    updateFilter: (state, { payload }: PayloadAction<FilterPending>) => {
      state.filters = state?.filters?.map((filter) =>
        filter.id === payload.id ? payload : filter
      );
    },
  },
});

export const selectMappingCurrent = (
  state: RootState
): Partial<Resource> | undefined => state.mapping.current;
export const selectMappingFilters = (
  state: RootState
): FilterPending[] | undefined => state.mapping.filters;

export default mappingSlice.reducer;
export const {
  resetMappingCreation,
  initMappingCreation,
  updateMapping,
  addFilter,
  updateFilter,
} = mappingSlice.actions;
