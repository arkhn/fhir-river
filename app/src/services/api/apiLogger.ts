import {
  MiddlewareAPI,
  Middleware,
  isRejectedWithValue,
} from "@reduxjs/toolkit";

import { logApiError } from "features/logger/loggerSlice";

const apiLogger: Middleware = (api: MiddlewareAPI) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    api.dispatch(logApiError(action.payload));
  }
  return next(action);
};

export default apiLogger;
