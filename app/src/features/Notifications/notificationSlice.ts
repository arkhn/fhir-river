import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { SnackbarKey, VariantType } from "notistack";

import { RootState } from "app/store";

type Notification = {
  message: string;
  key: SnackbarKey;
  variant: VariantType;
};

const notificationAdapter = createEntityAdapter<Notification>({
  selectId: ({ key }) => key,
});

const notificationSlice = createSlice({
  name: "notification",
  initialState: notificationAdapter.getInitialState(),
  reducers: {
    notificationAdded: notificationAdapter.addOne,
    notificationRemoved: notificationAdapter.removeOne,
  },
});

export const {
  notificationAdded,
  notificationRemoved,
} = notificationSlice.actions;

export const notificationSelectors = notificationAdapter.getSelectors<RootState>(
  (state) => state.notification
);

export default notificationSlice.reducer;
