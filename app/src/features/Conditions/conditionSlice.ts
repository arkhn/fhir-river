import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Condition } from "services/api/generated/api.generated";

export type PendingCondition = Partial<Condition> & { pending?: boolean };

const conditionAdapter = createEntityAdapter<PendingCondition>();

const conditionSlice = createSlice({
  name: "condition",
  initialState: conditionAdapter.getInitialState(),
  reducers: {
    conditionAdded: conditionAdapter.addOne,
    conditionsAdded: conditionAdapter.addMany,
    conditionUpdated: conditionAdapter.updateOne,
    conditionRemoved: conditionAdapter.removeOne,
    conditionsRemoved: conditionAdapter.removeAll,
  },
});

export const {
  conditionAdded,
  conditionsAdded,
  conditionUpdated,
  conditionRemoved,
  conditionsRemoved,
} = conditionSlice.actions;

export const conditionSelectors = conditionAdapter.getSelectors<RootState>(
  (state) => state.condition
);

export default conditionSlice.reducer;
