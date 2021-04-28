import { createSlice, createAction } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type { Source, Credential } from "services/api/generated/api.generated";

export enum EditTypeEnum {
  Source = "SOURCE",
  Credential = "CREDENTIAL",
  Owners = "OWNERS",
}

type SourceSliceState = {
  current?: Source;
  credential?: Credential;
  editType?: EditTypeEnum;
};

const initialState: SourceSliceState = {};

export const editSource = createAction<Source>("editSource");
export const sourceEdited = createAction<Source>("sourceEdited");
export const editCredential = createAction<Source>("editCredential");
export const credentialEdited = createAction<Credential>("credentialEdited");

const sourceSlice = createSlice({
  name: "source",
  initialState,
  reducers: {
    initSource: () => initialState,
    createSource: (state) => {
      state.editType = EditTypeEnum.Source;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(editSource, (state, { payload }) => {
      state.current = payload;
      state.editType = EditTypeEnum.Source;
    });
    builder.addCase(sourceEdited, (state, { payload }) => {
      state.current = payload;
      state.editType = EditTypeEnum.Credential;
    });
    builder.addCase(editCredential, (state, { payload }) => {
      state.current = payload;
      state.editType = EditTypeEnum.Credential;
    });
    builder.addCase(credentialEdited, (state, { payload }) => {
      state.credential = payload;
      state.editType = EditTypeEnum.Owners;
    });
  },
});

export const { initSource, createSource } = sourceSlice.actions;

export const selectSourceCurrent = (state: RootState): Source | undefined =>
  state.source.current;
export const selectEditType = (state: RootState): EditTypeEnum | undefined =>
  state.source.editType;
export const selectSourceCredential = (
  state: RootState
): Credential | undefined => state.source.credential;

export default sourceSlice.reducer;
