import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { makeStyles, Theme, Typography } from "@material-ui/core";

import IconButton from "common/components/IconButton";

import { ElementNode } from "./resourceTreeSlice";

type TreeItemLabelProps = {
  elementNode: ElementNode;
  isArrayItem?: boolean;
  onCreateItem: () => Promise<void>;
  onDeleteItem: () => Promise<void>;
};

const useStyle = makeStyles((theme: Theme) => ({
  treeItemContainer: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    "&:hover": {
      "& button": {
        display: "flex",
      },
    },
  },
  icon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fill: theme.palette.text.primary,
  },
  treeItemTitle: {
    marginLeft: theme.spacing(1),
    fontWeight: 500,
  },
  treeItemType: {
    marginLeft: theme.spacing(1),
    fontWeight: 400,
    flexGrow: 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    width: 1,
    textOverflow: "ellipsis",
    display: "inline-block",
  },
}));

const TreeItemLabel = ({
  elementNode,
  isArrayItem,
  onDeleteItem,
  onCreateItem,
}: TreeItemLabelProps): JSX.Element => {
  const classes = useStyle();

  let iconName: IconName | null = null;

  if (!elementNode.isArray) {
    switch (elementNode.kind) {
      case "primitive":
        iconName = IconNames.TAG;
        break;
      case "complex":
      case "choice":
        iconName = IconNames.FOLDER_OPEN;
        break;
      default:
        break;
    }
  } else {
    iconName =
      elementNode.type === "Extension"
        ? IconNames.CODE_BLOCK
        : (iconName = IconNames.LAYERS);
  }

  const handleDeleteItemClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    onDeleteItem();
  };

  const handleAddItemClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    onCreateItem();
  };

  const handleAddExtensionClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
  };

  return (
    <div className={classes.treeItemContainer}>
      {iconName && (
        <Icon className={classes.icon} icon={iconName} iconSize={15} />
      )}
      <Typography
        className={classes.treeItemTitle}
        display="inline"
        color="textPrimary"
      >
        {elementNode.name}
      </Typography>
      <Typography
        display="inline"
        variant="subtitle2"
        color="textSecondary"
        className={classes.treeItemType}
      >
        {elementNode.type}
      </Typography>
      {isArrayItem && (
        <IconButton icon={IconNames.TRASH} onClick={handleDeleteItemClick} />
      )}
      {elementNode.isArray && (
        <IconButton icon={IconNames.ADD} onClick={handleAddItemClick} />
      )}
      {elementNode.kind === "complex" && !elementNode.isArray && (
        <IconButton
          icon={IconNames.CODE_BLOCK}
          onClick={handleAddExtensionClick}
        />
      )}
    </div>
  );
};

export default TreeItemLabel;
