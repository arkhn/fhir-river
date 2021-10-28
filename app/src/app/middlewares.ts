import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";

const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { payload: error } = action;
    const { data: errorData } = error;
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
    } else console.log(action);
  }
  return next(action);
};

export { rtkQueryErrorLogger };
