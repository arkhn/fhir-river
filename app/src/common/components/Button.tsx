/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import {
  Button as MuiButton,
  makeStyles,
  ButtonProps as MuiButtonProps,
  withStyles,
} from "@material-ui/core";
import { Typography } from "@material-ui/core";

type ButtonProps = MuiButtonProps & {
  //
};

export const EditedButton = withStyles((theme) => ({
  root: {
    textTransform: "none",
    boxShadow: theme.shadows[0],
    "&:hover": { boxShadow: theme.shadows[0] },
    "& .MuiButton-startIcon": {
      height: 12,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fill: "#fff",
    },
  },
}))(MuiButton);

const useStyle = makeStyles((theme) => ({
  button: {
    border: `1px solid `,
  },
  inherit: {},
  primary: {
    border: `1px solid ${theme.palette.primary.dark}`,
  },
  secondary: {
    border: `1px solid ${theme.palette.secondary.dark}`,
    "&:hover": {
      border: `1px solid ${theme.palette.secondary.main}`,
    },
  },
  default: {},
}));

const Button = ({ ...buttonProps }: ButtonProps): JSX.Element => {
  const classes = useStyle(buttonProps.color);
  const { startIcon, color } = buttonProps;
  return (
    <EditedButton
      variant="contained"
      {...buttonProps}
      className={classes[color ?? "default"]}
    >
      <Typography>{buttonProps.children}</Typography>
    </EditedButton>
  );
};

export default Button;
