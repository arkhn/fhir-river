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
  rootListItem: {
    padding: 0,
    borderRadius: theme.shape.borderRadius,
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
