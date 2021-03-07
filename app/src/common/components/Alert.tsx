import React from "react";

import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

type AlertProps = {
  severity: "error" | "success";
  open: boolean;
  onClose: (event?: React.SyntheticEvent, reason?: string) => void;
  message: string;
};

export const Alert = ({
  severity,
  open,
  onClose,
  message,
}: AlertProps): JSX.Element => {
  const { vertical, horizontal } = {
    vertical: "bottom" as const,
    horizontal: "right" as const,
  };

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical, horizontal }}
      key={vertical + horizontal}
    >
      <MuiAlert severity={severity} elevation={6} variant="filled">
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;
