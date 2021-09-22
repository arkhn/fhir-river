import React from "react";

import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  withStyles,
  Typography,
  TypographyProps,
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
    fill: theme.palette.text.primary,
  },
  containedPrimary: {
    border: `1px solid ${theme.palette.primary.dark}`,
    "& .MuiButton-startIcon": { fill: theme.palette.common.white },
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
  typographyColor?: TypographyProps["color"];
};

const Button = React.forwardRef(
  <C extends React.ElementType>(
    { typographyColor, children, ...buttonProps }: ButtonProps<C>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any
  ): JSX.Element => {
    return (
      <EditedButton disableElevation {...buttonProps} ref={ref}>
        {typeof children === "string" ? (
          <Typography color={typographyColor}>{children}</Typography>
        ) : (
          children
        )}
      </EditedButton>
    );
  }
);

Button.displayName = "Button";

export default Button;
