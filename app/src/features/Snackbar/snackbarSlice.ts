import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SnackbarKey, VariantType } from "notistack";

export type SnackbarNotificationState = {
  message: string;
  key: SnackbarKey;
  options: { key: SnackbarKey; variant: VariantType };
  dismissed?: boolean;
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
    addNotification: (
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

export const { addNotification, removeSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
