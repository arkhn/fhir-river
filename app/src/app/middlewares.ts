import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";

const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    if (action.payload.data.issue) {
      action.payload.data.issue.forEach((issue: any) =>
        console.log(
          action.payload.status,
          action.meta.arg.endpointName,
          issue.diagnostics
        )
      );
    } else
      console.log(
        action.payload.status,
        action.meta.arg.endpointName,
        action.payload.data.detail
      );
  }
  return next(action);
};

export { rtkQueryErrorLogger };
