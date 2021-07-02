import React from "react";

import {
  Button as MuiButton,
  ButtonProps,
  withStyles,
} from "@material-ui/core";
import { Typography } from "@material-ui/core";

export const EditedButton = withStyles((theme) => ({
  root: {
    endIcon: {
      fill: theme.palette.text.primary,
    },
    textTransform: "none",
    "& .MuiButton-startIcon": {
      height: 12,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fill: "#fff",
    },
  },
  containedPrimary: {
    border: `1px solid ${theme.palette.primary.dark}`,
  },
  containedSecondary: {
    border: `1px solid ${theme.palette.secondary.dark}`,
    "&:hover": {
      border: `1px solid ${theme.palette.secondary.dark}`,
    },
    "& .MuiButton-startIcon": {
      fill: theme.palette.secondary.contrastText,
    },
  },
  colorInherit: {
    "& .MuiButton-startIcon": {
      fill: theme.palette.text.secondary,
    },
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "inherit",
      color: theme.palette.text.primary,
      "& .MuiButton-startIcon": {
        fill: theme.palette.text.primary,
      },
    },
  },
}))(MuiButton);

const Button = ({ ...buttonProps }: ButtonProps): JSX.Element => {
  return (
    <EditedButton disableElevation {...buttonProps}>
      <Typography>{buttonProps.children}</Typography>
    </EditedButton>
  );
};

export default Button;
