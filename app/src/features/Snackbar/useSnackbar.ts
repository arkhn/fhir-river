import React from "react";

import { SnackbarKey, SnackbarProvider } from "notistack";

import { useAppDispatch, useAppSelector } from "app/store";

import { removeSnackbar } from "./snackbarSlice";

let displayed: SnackbarKey[] = [];

const useSnackbar = (notistackRef: React.RefObject<SnackbarProvider>): void => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.snackbar || []);
  const storeDisplayed = (id: SnackbarKey) => {
    displayed = [...displayed, id];
  };
  const removeDisplayed = (id: SnackbarKey) => {
    displayed = [...displayed.filter((key) => id !== key)];
  };

  React.useEffect(() => {
    notifications.forEach(
      ({ key, message, options = {}, dismissed = false }) => {
        if (dismissed) {
          notistackRef.current?.closeSnackbar(key);
          return;
        }

        if (displayed.includes(key)) return;

        notistackRef.current?.enqueueSnackbar(message, {
          key,
          ...options,
          onExited: (event, myKey) => {
            dispatch(removeSnackbar({ key: myKey }));
            removeDisplayed(myKey);
          },
        });

        storeDisplayed(key);
      }
    );
  }, [dispatch, notifications, notistackRef]);
};

export default useSnackbar;
