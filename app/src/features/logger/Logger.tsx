import React from "react";

import { useAppDispatch, useAppSelector } from "app/store";
import Alert from "common/components/Alert";

import { logApiError, selectApiError } from "./loggerSlice";

type ApiError = Record<string, string[]>;

const Logger = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectApiError);
  const isAlertOpen = !!error;
  const status = error?.status;
  const data = error?.data as ApiError | null;

  const handleClose = () => {
    dispatch(logApiError(null));
  };

  const formatError = (data: ApiError): string =>
    Object.keys(data).reduce(
      (acc, key) =>
        acc +
        `"${key}" [${data[key].toString()}]
      `,
      ""
    );

  const message = data && status ? `Error ${status}: ${formatError(data)}` : "";

  return (
    <Alert
      severity="error"
      open={isAlertOpen}
      onClose={handleClose}
      message={message}
    />
  );
};

export default Logger;
