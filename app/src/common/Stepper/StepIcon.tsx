import React from "react";

import { makeStyles, StepIconProps } from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import clsx from "clsx";

const useCustomStepIconStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.divider,
    display: "flex",
    height: 22,
    alignItems: "center",
  },
  active: {
    color: theme.palette.primary.main,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  completed: {
    color: theme.palette.primary.main,
    zIndex: 1,
    fontSize: 22,
  },
}));

const StepIcon = ({ active, completed }: StepIconProps): JSX.Element => {
  const classes = useCustomStepIconStyles();

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {completed ? (
        <CheckIcon className={classes.completed} />
      ) : (
        <div className={classes.circle} />
      )}
    </div>
  );
};

export default StepIcon;
