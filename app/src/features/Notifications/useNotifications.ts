import React from "react";

import { SnackbarKey, SnackbarProvider } from "notistack";

import { useAppDispatch, useAppSelector } from "app/store";

import {
  notificationRemoved,
  notificationSelectors,
} from "./notificationSlice";

let displayed: SnackbarKey[] = [];

/**
 * Handles notifications by displaying all pending items from `notification`
 * slice store.
 * @param notistackRef
 */
const useNotifications = (
  notistackRef: React.RefObject<SnackbarProvider>
): void => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(notificationSelectors.selectAll);
  const storeDisplayed = (id: SnackbarKey) => {
    displayed = [...displayed, id];
  };
  const removeDisplayed = (id: SnackbarKey) => {
    displayed = displayed.filter((key) => id !== key);
  };

  // Enqueue all snackbar notifications that are not already displayed
  React.useEffect(() => {
    notifications.forEach(({ key, message, variant }) => {
      if (displayed.includes(key)) return;

      notistackRef.current?.enqueueSnackbar(message, {
        key,
        variant,
        onExited: (_, myKey) => {
          dispatch(notificationRemoved(myKey));
          removeDisplayed(myKey);
        },
      });

      storeDisplayed(key);
    });
  }, [dispatch, notifications, notistackRef]);
};

export default useNotifications;
