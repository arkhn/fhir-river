import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { makeStyles, Tooltip, Typography } from "@material-ui/core";
import { usePopupState } from "material-ui-popup-state/hooks";
import { useTranslation } from "react-i18next";

import IconButton from "common/components/IconButton";

import { ElementNode } from "./resourceTreeSlice";
import SliceNameDialog from "./SliceNameDialog";
import TreeNodeBadge from "./TreeNodeBadge";

type TreeItemLabelProps = {
  elementNode: ElementNode;
  isArrayItem?: boolean;
  onCreateItem: (sliceName?: string) => Promise<void>;
  onDeleteItem: () => Promise<void>;
  onAddExtension: () => Promise<void>;
};

const useStyle = makeStyles((theme) => ({
  treeItemContainer: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    "& button": {
      display: "none",
      marginRight: theme.spacing(0.5),
    },
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
    fill: theme.palette.icons.resourceTree.main,
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
  onAddExtension,
}: TreeItemLabelProps): JSX.Element => {
  const classes = useStyle();
  const { t } = useTranslation();
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popup-${elementNode.id}`,
  });
  const [isSliceDialogOpen, setSliceDialogOpen] = useState(false);

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

  const handleAddExtensionClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    onAddExtension();
  };

  const handleSliceDialogOpen = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    popupState.close();
    setSliceDialogOpen(true);
  };

  const handleSliceDialogClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSliceDialogOpen(false);
  };

  const handleAddSlice = (name: string) => {
    onCreateItem(name);
  };

  const handleAddItemClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    popupState.close();
    onCreateItem();
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
      {elementNode.kind === "complex" && !elementNode.isArray && (
        <Tooltip title={t("addExtension").toString()} arrow>
          <div>
            <IconButton
              icon={IconNames.CODE_BLOCK}
              onClick={handleAddExtensionClick}
            />
          </div>
        </Tooltip>
      )}
      {isArrayItem && (
        <>
          <Tooltip
            title={
              elementNode.sliceName
                ? t("deleteSlice").toString()
                : t("deleteItem").toString()
            }
            arrow
          >
            <div>
              <IconButton
                icon={IconNames.TRASH}
                onClick={handleDeleteItemClick}
              />
            </div>
          </Tooltip>
        </>
      )}
      {elementNode.isArray && elementNode.type !== "Extension" && (
        <>
          <Tooltip title={t("addItem").toString()} arrow>
            <div>
              <IconButton icon={IconNames.ADD} onClick={handleAddItemClick} />
            </div>
          </Tooltip>
          <Tooltip title={t("addSlice").toString()} arrow>
            <div>
              <IconButton
                icon={IconNames.PIE_CHART}
                onClick={handleSliceDialogOpen}
              />
            </div>
          </Tooltip>
          <SliceNameDialog
            onSubmit={handleAddSlice}
            open={isSliceDialogOpen}
            onClose={handleSliceDialogClose}
          />
        </>
      )}
      <TreeNodeBadge elementNode={elementNode} />
    </div>
  );
};

export default TreeItemLabel;
