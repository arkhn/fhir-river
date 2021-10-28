import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { SnackbarKey, VariantType } from "notistack";
import { v4 as uuid } from "uuid";

import { addNotification } from "features/Snackbar/snackbarSlice";

const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { payload: error } = action;
    const { data: errorData, status: errorStatus } = error;
    const { endpointName } = action.meta.arg;
    const key = uuid();
    const options: { key: SnackbarKey; variant: VariantType } = {
      key,
      variant: "error",
    };
    if (error.error) {
      next(
        addNotification({
          key,
          notification: {
            key,
            message: `${errorStatus} | ${endpointName} | ${JSON.stringify(
              error.error
            )}`,
            options,
          },
        })
      );
    } else if (errorData.issue) {
      next(
        addNotification({
          key,
          notification: {
            key,
            message: `${errorStatus} | ${endpointName} | ${JSON.stringify(
              errorData.issue.map(({ diagnostics }: any) => diagnostics)
            )}`,
            options,
          },
        })
      );
    } else if (errorData) {
      next(
        addNotification({
          key,
          notification: {
            key,
            message: `${errorStatus} | ${endpointName} | ${JSON.stringify(
              errorData
            )}`,
            options,
          },
        })
      );
    } else
      next(
        addNotification({
          key,
          notification: {
            key,
            message: `${errorStatus} | ${endpointName} | ${JSON.stringify(
              action
            )}`,
            options,
          },
        })
      );
  }
  return next(action);
};

export { rtkQueryErrorLogger };
