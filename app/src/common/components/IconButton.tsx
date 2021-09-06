import React from "react";

import { Icon, IconName, MaybeElement } from "@blueprintjs/core";
import {
  IconButton as MuiIconButton,
  makeStyles,
  IconButtonProps as MuiIconButtonProps,
} from "@material-ui/core";

type IconButtonProps = MuiIconButtonProps & {
  icon: IconName | MaybeElement;
};

const useStyle = makeStyles((theme) => ({
  icon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fill: theme.palette.icons.resourceTree.light,
  },
}));

const IconButton = ({
  icon,
  ...iconButtonProps
}: IconButtonProps): JSX.Element => {
  const classes = useStyle();
  return (
    <MuiIconButton size="small" {...iconButtonProps}>
      <Icon className={classes.icon} icon={icon} iconSize={15} />
    </MuiIconButton>
  );
};

export default IconButton;
