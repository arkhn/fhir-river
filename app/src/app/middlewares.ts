import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import { notificationAdded } from "features/Notifications/notificationSlice";

// handle notifications for errors
const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { payload: error } = action;
    const { data: errorData, status: errorStatus } = error;
    const { endpointName } = action.meta.arg;
    const key = uuid();
    let message = "";
    if (error?.error) {
      message = `${errorStatus} | ${endpointName} | ${JSON.stringify(
        error.error
      )}`;
    } else if (errorData?.issue) {
      message = `${errorStatus} | ${endpointName} | ${JSON.stringify(
        errorData.issue.map(({ diagnostics }: any) => diagnostics)
      )}`;
    } else if (errorData) {
      message = `${errorStatus} | ${endpointName} | ${JSON.stringify(
        errorData
      )}`;
    } else
      message = `${errorStatus} | ${endpointName} | ${JSON.stringify(action)}`;
    next(notificationAdded({ key, message, variant: "error" }));
  }
  return next(action);
};

export { rtkQueryErrorLogger };
