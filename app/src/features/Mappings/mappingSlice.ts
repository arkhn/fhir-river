import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import type { RootState } from "app/store";
import type {
  Column,
  Filter,
  Resource,
} from "services/api/generated/api.generated";

export type PendingJoin = {
  id: string;
  columns: [Partial<Column>, Partial<Column>];
};

export type PendingFilter = Partial<Filter & { col: Partial<Column> }>;

type MappingState = {
  current?: Partial<Resource>;
  filters?: PendingFilter[];
  joins?: Record<string, PendingJoin[]>;
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
      state.joins = {};
    },
    updateMapping: (state, { payload }: PayloadAction<Partial<Resource>>) => {
      state.current = { ...state.current, ...payload };
    },
    addFilter: (state) => {
      if (state.filters) {
        state.filters = [...state.filters, { id: uuid(), col: { id: uuid() } }];
      }
    },
    updateFilter: (state, { payload }: PayloadAction<PendingFilter>) => {
      state.filters = state?.filters?.map((filter) =>
        filter.id === payload.id ? payload : filter
      );
    },
    deleteFilter: (state, { payload }: PayloadAction<string>) => {
      state.filters = state?.filters?.filter(({ id }) => id !== payload);
    },
    addJoin: (state, { payload }: PayloadAction<string>) => {
      if (state.filters && state.joins) {
        const filterJoins = state.joins[payload] ?? [];
        state.joins[payload] = [
          ...filterJoins,
          { id: uuid(), columns: [{}, {}] },
        ];
      }
    },
    deleteJoin: (
      state,
      { payload }: PayloadAction<{ column: string; join: string }>
    ) => {
      if (state.filters && state.joins) {
        state.joins[payload.column] = state.joins[payload.column]?.filter(
          (join) => join.id !== payload.join
        );
      }
    },
    updateJoin: (
      state,
      { payload }: PayloadAction<{ column: string; join: PendingJoin }>
    ) => {
      const { column, join } = payload;
      if (state.joins && state.joins[column]) {
        state.joins[column] = state.joins[column].map((_join) =>
          _join.id === join.id ? join : _join
        );
      }
    },
  },
});

export const selectMappingCurrent = (
  state: RootState
): Partial<Resource> | undefined => state.mapping.current;
export const selectMappingFilters = (
  state: RootState
): PendingFilter[] | undefined => state.mapping.filters;
export const selectMappingJoins = (
  state: RootState
): Record<string, PendingJoin[]> => state.mapping.joins ?? {};

export const {
  resetMappingCreation,
  initMappingCreation,
  updateMapping,
  addFilter,
  updateFilter,
  deleteFilter,
  addJoin,
  updateJoin,
  deleteJoin,
} = mappingSlice.actions;

export default mappingSlice.reducer;
