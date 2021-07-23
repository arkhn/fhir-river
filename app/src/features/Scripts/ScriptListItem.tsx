import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { makeStyles, Typography } from "@material-ui/core";
import clsx from "clsx";

import { Scripts } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  icon: {
    fill: theme.palette.primary.main,
    display: "flex",
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
  marginLeft: {
    marginLeft: theme.spacing(1),
  },
  iconTextContainer: {
    display: "flex",
    alignItems: "center",
  },
  root: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    marginRight: theme.spacing(1),
  },
  selected: {
    color: theme.palette.primary.main,
  },
}));

type ScriptListItemProps = {
  script: Scripts;
  selected?: boolean;
};

const ScriptListItem = ({
  script,
  selected,
}: ScriptListItemProps): JSX.Element => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, { [classes.selected]: selected })}>
      <div className={classes.iconTextContainer}>
        {selected && (
          <Icon
            icon={IconNames.SMALL_TICK}
            className={clsx(classes.icon, classes.marginRight)}
          />
        )}
        <Typography
          className={classes.itemTitle}
          display="inline"
          variant="subtitle1"
        >
          {script.name}
        </Typography>
      </div>
      <div className={classes.iconTextContainer}>
        <Typography display="inline" variant="subtitle2">
          {script.description}
        </Typography>
        {selected && (
          <Icon
            icon={IconNames.CROSS}
            className={clsx(classes.icon, classes.marginLeft)}
          />
        )}
      </div>
    </div>
  );
};

export default ScriptListItem;
