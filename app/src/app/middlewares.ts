/* eslint-disable @typescript-eslint/no-unused-vars */
import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";

import { ApiValidationError } from "services/api/errors";

const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { payload: error } = action;
    const { data: errorData, status: errorStatus } = error;
    const { endpointName } = action.meta.arg;
    if (error.error) {
      console.log(JSON.stringify(error.error));
    } else if (errorData.issue) {
      console.log(
        JSON.stringify(
          errorData.issue.map(({ diagnostics }: any) => diagnostics)
        )
      );
    } else if (errorData) {
      console.log(JSON.stringify(errorData));
    }
    console.log(action);
  }
  return next(action);
};

export { rtkQueryErrorLogger };
