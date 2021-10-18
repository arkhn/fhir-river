import React from "react";

import { Popper, PopperProps } from "@material-ui/core";

const AutocompletePopper = (props: PopperProps): JSX.Element => {
  return (
    <Popper
      {...props}
      style={{ width: "fit-content", maxWidth: "90vw" }}
      placement="bottom-start"
    />
  );
};

export default AutocompletePopper;
