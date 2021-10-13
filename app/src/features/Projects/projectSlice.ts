import { createSlice, createAction } from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import type {
  Project as ProjectType,
  Credential as CredentialType,
} from "services/api/generated/api.generated";

export enum EditTypeEnum {
  Project = "PROJECT",
  Credential = "CREDENTIAL",
  Owners = "OWNERS",
}

type ProjectSliceState = {
  current?: ProjectType;
  credential?: CredentialType;
  editType?: EditTypeEnum;
};

const initialState: ProjectSliceState = {};

export const editProject = createAction<ProjectType>("editProject");
export const projectEdited = createAction<ProjectType>("projectEdited");
export const editCredential = createAction<ProjectType>("editCredential");
export const credentialEdited = createAction<CredentialType>(
  "credentialEdited"
);

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    initProject: () => initialState,
    createProject: (state) => {
      state.editType = EditTypeEnum.Project;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(editProject, (state, { payload }) => {
      state.current = payload;
      state.editType = EditTypeEnum.Project;
    });
    builder.addCase(projectEdited, (state, { payload }) => {
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

export const { initProject, createProject } = projectSlice.actions;

export const selectProjectCurrent = (
  state: RootState
): ProjectType | undefined => state.project.current;
export const selectEditType = (state: RootState): EditTypeEnum | undefined =>
  state.project.editType;
export const selectProjectCredential = (
  state: RootState
): CredentialType | undefined => state.project.credential;

export default projectSlice.reducer;
