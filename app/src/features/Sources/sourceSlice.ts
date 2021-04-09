import { createSlice, createAction } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Source, Credential } from "services/api/generated/api.generated";

type SourceSliceState = {
  current?: Source;
  editing: boolean;
  credential?: Credential;
  credentialEditing: boolean;
  ownersEditing: boolean;
};

const initialState: SourceSliceState = {
  current: undefined,
  editing: false,
  credential: undefined,
  credentialEditing: false,
  ownersEditing: false,
};

export const editSource = createAction<Source>("editSource");
export const sourceEdited = createAction<Source>("sourceEdited");
export const credentialEdited = createAction<Credential>("credentialEdited");

const sourceSlice = createSlice({
  name: "source",
  initialState,
  reducers: {
    initSource: () => initialState,
    createSource: (state) => {
      state.editing = true;
    },
    editCredential: (state) => {
      state.credentialEditing = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(editSource, (state, { payload }) => {
      state.current = payload;
      state.editing = true;
    });
    builder.addCase(sourceEdited, (state, { payload }) => {
      state.editing = false;
      state.credentialEditing = true;
      state.current = payload;
    });
    builder.addCase(credentialEdited, (state, { payload }) => {
      state.credential = payload;
      state.credentialEditing = false;
      state.ownersEditing = true;
    });
  },
});

export const { initSource, createSource, editCredential } = sourceSlice.actions;

export const selectSourceCurrent = (state: RootState): Source | undefined =>
  state.source.current;
export const selectIsSourceEditing = (state: RootState): boolean =>
  state.source.editing;
export const selectSourceCredential = (
  state: RootState
): Credential | undefined => state.source.credential;
export const selectIsSourceCredentialEditing = (state: RootState): boolean =>
  state.source.credentialEditing;
export const selectIsCredentialOwnersEditing = (state: RootState): boolean =>
  state.source.ownersEditing;

export default sourceSlice.reducer;
