import React from "react";

import { makeStyles, Typography } from "@material-ui/core";

import { Scripts } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
  },
  itemTitle: {
    marginRight: theme.spacing(1),
  },
}));

type ScriptListItemProps = {
  script: Scripts;
  selected?: boolean;
  onClick?: (script: Scripts) => void;
};

const ScriptListItem = ({ script }: ScriptListItemProps): JSX.Element => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography
        className={classes.itemTitle}
        display="inline"
        variant="subtitle1"
      >
        {script.name}
      </Typography>
      <Typography display="inline" variant="subtitle2">
        {script.description}
      </Typography>
    </div>
  );
};

export default ScriptListItem;
