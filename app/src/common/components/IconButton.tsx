import React from "react";

import { Icon, IconName, MaybeElement } from "@blueprintjs/core";
import {
  IconButton as MuiIconButton,
  makeStyles,
  Theme,
} from "@material-ui/core";

type IconButtonProps = {
  icon: IconName | MaybeElement;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const useStyle = makeStyles((theme: Theme) => ({
  icon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fill: theme.palette.text.secondary,
  },
  labelEndIcons: {
    display: "none",
    marginRight: 4,
  },
}));

const IconButton = ({ icon, onClick }: IconButtonProps): JSX.Element => {
  const classes = useStyle();
  return (
    <MuiIconButton
      size="small"
      className={classes.labelEndIcons}
      onClick={onClick}
    >
      <Icon className={classes.icon} icon={icon} iconSize={15} />
    </MuiIconButton>
  );
};

export default IconButton;
