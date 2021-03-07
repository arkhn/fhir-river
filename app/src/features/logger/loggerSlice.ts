import { createSlice, createAction } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@rtk-incubator/rtk-query";

import { RootState } from "app/store";

const initialState = null as null | FetchBaseQueryError;

export const logApiError = createAction<null | FetchBaseQueryError>(
  "logApiError"
);

const loggerSlice = createSlice({
  name: "logger",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(logApiError, (state, action) => {
      return action.payload;
    });
  },
});

export const selectApiError = (state: RootState): null | FetchBaseQueryError =>
  state.logger;

export default loggerSlice.reducer;
