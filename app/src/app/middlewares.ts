import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import { addNotification } from "features/Snackbar/snackbarSlice";

const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { payload: error } = action;
    const { data: errorData, status: errorStatus } = error;
    const { endpointName } = action.meta.arg;
    const key = uuid();
    if (error.error) {
      next(
        addNotification({
          key,
          notification: {
            key,
            message: `${errorStatus} | ${endpointName} | ${JSON.stringify(
              error.error
            )}`,
            options: {
              key,
              variant: "error",
            },
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
            options: {
              key,
              variant: "error",
            },
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
            options: {
              key,
              variant: "error",
            },
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
            options: {
              key,
              variant: "error",
            },
          },
        })
      );
  }
  return next(action);
};

export { rtkQueryErrorLogger };
