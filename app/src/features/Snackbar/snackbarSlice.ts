import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SnackbarKey, VariantType } from "notistack";

export type SnackbarNotificationState = {
  message: string;
  key: SnackbarKey;
  options: { key: SnackbarKey; variant: VariantType };
};

type SnackbarSliceState = {
  notifications: SnackbarNotificationState[];
};

const initialState: SnackbarSliceState = {
  notifications: [],
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    addSnackbar: (
      state,
      {
        payload,
      }: PayloadAction<{
        key: SnackbarKey;
        notification: SnackbarNotificationState;
      }>
    ) => {
      const { notification, key } = payload;
      state.notifications = [
        ...state.notifications,
        {
          ...notification,
          key,
        },
      ];
    },
    removeSnackbar: (
      state,
      { payload }: PayloadAction<{ key: SnackbarKey }>
    ) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.key !== payload.key
      );
    },
  },
});

export const { addSnackbar, removeSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
