import React from "react";

import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  withStyles,
  Typography,
} from "@material-ui/core";

export const EditedButton = withStyles((theme) => ({
  root: {
    textTransform: "none",
  },
  startIcon: {
    height: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fill: theme.palette.common.white,
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
  disabled: {
    border: "none",
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

type ButtonProps<C extends React.ElementType> = MuiButtonProps<
  C,
  { component?: C }
> & {
  typographyColor?:
    | "initial"
    | "inherit"
    | "primary"
    | "secondary"
    | "textPrimary"
    | "textSecondary"
    | "error";
};

const Button = React.forwardRef(
  <C extends React.ElementType>(
    { typographyColor, children, ...buttonProps }: ButtonProps<C>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any
  ): JSX.Element => {
    return (
      <EditedButton disableElevation {...buttonProps} ref={ref}>
        <Typography color={typographyColor}>{children}</Typography>
      </EditedButton>
    );
  }
);

Button.displayName = "Button";

export default Button;
