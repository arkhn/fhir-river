import React from "react";

import {
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core";

import { Resource } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  dialog: {
    padding: theme.spacing(3),
    height: 470,
  },
  title: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  checkboxForm: {
    cursor: "pointer",
    paddingTop: theme.spacing(0.5),
  },
  rootListItem: {
    padding: 0,
    borderRadius: theme.shape.borderRadius,
  },
  textField: {
    padding: theme.spacing(0, 3),
  },
}));

type BatchResourceListItemType = {
  handleClick: (id: string) => void;
  checked: boolean;
  resource: Resource;
};

const BatchResourceListItem = ({
  handleClick,
  checked,
  resource,
}: BatchResourceListItemType): JSX.Element => {
  const classes = useStyles();

  const handleSelectItem = () => {
    handleClick(resource.id);
  };

  return (
    <ListItem
      role={undefined}
      key={`resource-option-${resource.id}`}
      button
      onClick={handleSelectItem}
      classes={{ root: classes.rootListItem }}
    >
      <ListItemIcon>
        <Checkbox color="primary" checked={checked} />
      </ListItemIcon>
      <ListItemText
        primary={`${resource.definition_id} ${
          resource.label ? `- ${resource.label}` : ""
        }`}
      />
    </ListItem>
  );
};

export default BatchResourceListItem;
