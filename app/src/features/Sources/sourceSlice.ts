import { createSlice, createAction } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Source, Credential } from "services/api/generated/api.generated";

export enum EditedItemEnum {
  Source = "SOURCE",
  Credential = "CREDENTIAL",
  Owners = "OWNERS",
}

type SourceSliceState = {
  current?: Source;
  credential?: Credential;
  editedItem?: EditedItemEnum;
};

const initialState: SourceSliceState = {};

export const editSource = createAction<Source>("editSource");
export const sourceEdited = createAction<Source>("sourceEdited");
export const credentialEdited = createAction<Credential>("credentialEdited");

const sourceSlice = createSlice({
  name: "source",
  initialState,
  reducers: {
    initSource: () => initialState,
    createSource: (state) => {
      state.editedItem = EditedItemEnum.Source;
    },
    editCredential: (state) => {
      state.editedItem = EditedItemEnum.Credential;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(editSource, (state, { payload }) => {
      state.current = payload;
      state.editedItem = EditedItemEnum.Source;
    });
    builder.addCase(sourceEdited, (state, { payload }) => {
      state.editedItem = EditedItemEnum.Credential;
      state.current = payload;
    });
    builder.addCase(credentialEdited, (state, { payload }) => {
      state.credential = payload;
      state.editedItem = EditedItemEnum.Owners;
    });
  },
});

export const { initSource, createSource, editCredential } = sourceSlice.actions;

export const selectSourceCurrent = (state: RootState): Source | undefined =>
  state.source.current;
export const selectEditedItem = (
  state: RootState
): EditedItemEnum | undefined => state.source.editedItem;
export const selectSourceCredential = (
  state: RootState
): Credential | undefined => state.source.credential;

export default sourceSlice.reducer;
