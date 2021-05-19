/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";

import { Icon, MaybeElement } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import {
  IconButton as MuiIconButton,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { TreeItem as MuiTreeItem } from "@material-ui/lab";
import clsx from "clsx";

import useFhirResourceTreeData from "common/hooks/useFhirResourceTreeData";

import { ElementNode } from "./resourceTreeSlice";

type TreeItemProps = {
  elementNode: ElementNode;
  isArrayItem?: boolean;
};

const useStyle = makeStyles((theme: Theme) => ({
  icon: {
    fill: theme.palette.getContrastText(theme.palette.background.paper),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  treeItemTitle: {
    fontWeight: 500,
  },
  treeItemType: {
    fontWeight: 400,
    flexGrow: 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    width: 1,
    textOverflow: "ellipsis",
    display: "inline-block",
  },
  margin: {
    marginLeft: theme.spacing(1),
  },
  treeItem: {
    display: "flex",
    alignItems: "center",
    "&:hover": {
      "& button": {
        display: "flex",
      },
    },
  },
  treeItemIcons: {
    display: "none",
    "&:hover": {
      display: "flex",
    },
  },
}));

type IconButtonProps = {
  icon: IconName | MaybeElement;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const IconButton = ({ icon, onClick }: IconButtonProps): JSX.Element => {
  const classes = useStyle();
  return (
    <MuiIconButton
      size="small"
      className={classes.treeItemIcons}
      onClick={onClick}
    >
      <Icon className={classes.icon} icon={icon} iconSize={15} />
    </MuiIconButton>
  );
};

const TreeItem = ({ elementNode, isArrayItem }: TreeItemProps): JSX.Element => {
  const classes = useStyle();

  const [hasExpanded, setHasExpanded] = useState(false);
  const isPrimitive = elementNode.kind === "primitive";
  const isComplex = elementNode.kind === "complex";
  useFhirResourceTreeData(
    { id: elementNode.type ?? "", nodeId: elementNode.id },
    { skip: !isComplex || !hasExpanded || elementNode.isArray }
  );

  const handleIconButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
  };

  const handleIconClick = () => {
    setHasExpanded(true);
  };
  const handleLabelClick = () => {
    setHasExpanded(true);
  };

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
    iconName = IconNames.LAYERS;
  }

  const LabelContent = (): JSX.Element => {
    return (
      <div className={classes.treeItem}>
        {iconName && (
          <Icon className={classes.icon} icon={iconName} iconSize={15} />
        )}
        <Typography
          className={clsx(classes.margin, classes.treeItemTitle)}
          display="inline"
          color="textPrimary"
        >
          {elementNode.name}
        </Typography>
        <Typography
          display="inline"
          variant="subtitle2"
          color="textSecondary"
          className={clsx(classes.margin, classes.treeItemType)}
        >
          {elementNode.type}
        </Typography>
        {elementNode.isArray && (
          <IconButton icon={IconNames.ADD} onClick={handleIconButtonClick} />
        )}
        {isArrayItem && (
          <IconButton icon={IconNames.TRASH} onClick={handleIconButtonClick} />
        )}
        {elementNode.kind === "complex" && !elementNode.isArray && (
          <IconButton
            icon={IconNames.CODE_BLOCK}
            onClick={handleIconButtonClick}
          />
        )}
      </div>
    );
  };

  return (
    <MuiTreeItem
      nodeId={elementNode.id}
      label={<LabelContent />}
      onIconClick={handleIconClick}
      onLabelClick={handleLabelClick}
    >
      {elementNode.children.length > 0
        ? elementNode.children.map((node) => (
            <TreeItem
              key={node.id}
              elementNode={node}
              isArrayItem={elementNode.isArray}
            />
          ))
        : !isPrimitive && <div key="stub" />}
    </MuiTreeItem>
  );
};

export default TreeItem;
