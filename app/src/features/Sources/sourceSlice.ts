import { createSlice, createAction } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type {
  Source as SourceType,
  Credential as CredentialType,
} from "services/api/generated/api.generated";

export enum EditTypeEnum {
  Source = "SOURCE",
  Credential = "CREDENTIAL",
  Owners = "OWNERS",
}

type SourceSliceState = {
  current?: SourceType;
  credential?: CredentialType;
  editType?: EditTypeEnum;
};

const initialState: SourceSliceState = {};

export const editSource = createAction<SourceType>("editSource");
export const sourceEdited = createAction<SourceType>("sourceEdited");
export const editCredential = createAction<SourceType>("editCredential");
export const credentialEdited = createAction<CredentialType>(
  "credentialEdited"
);

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

export const selectSourceCurrent = (state: RootState): SourceType | undefined =>
  state.source.current;
export const selectEditType = (state: RootState): EditTypeEnum | undefined =>
  state.source.editType;
export const selectSourceCredential = (
  state: RootState
): CredentialType | undefined => state.source.credential;

export default sourceSlice.reducer;
