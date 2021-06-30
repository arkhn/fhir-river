/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import {
  Button as MuiButton,
  makeStyles,
  ButtonProps as MuiButtonProps,
} from "@material-ui/core";

type ButtonProps = MuiButtonProps & {
  //
};

const useStyle = makeStyles(() => ({}));

const IconButton = ({ ...buttonProps }: ButtonProps): JSX.Element => {
  const classes = useStyle();
  return <MuiButton size="small" {...buttonProps} />;
};

export default IconButton;
