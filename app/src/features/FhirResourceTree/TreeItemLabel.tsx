import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import {
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import {
  bindTrigger,
  bindMenu,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useTranslation } from "react-i18next";

import IconButton from "common/components/IconButton";

import { ElementNode } from "./resourceTreeSlice";
import SliceNameDialog from "./SliceNameDialog";

type TreeItemLabelProps = {
  elementNode: ElementNode;
  isArrayItem?: boolean;
  onCreateItem: (sliceName?: string) => Promise<void>;
  onDeleteItem: () => Promise<void>;
};

const useStyle = makeStyles((theme) => ({
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
  };

  const handleSliceDialogOpen = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleAddItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    popupState.close();
    onCreateItem();
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    popupState.open(e);
  };

  return (
    <>
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
          <>
            <IconButton
              icon={IconNames.ADD}
              {...bindTrigger(popupState)}
              onClick={handleMenuClick}
            />
            <Menu {...bindMenu(popupState)}>
              <MenuItem>
                <ListItemText
                  primary={t("addItem")}
                  onClick={handleAddItemClick}
                />
              </MenuItem>
              <MenuItem>
                <ListItemText
                  primary={t("addSlice")}
                  onClick={handleSliceDialogOpen}
                />
              </MenuItem>
            </Menu>
          </>
        )}
        {elementNode.kind === "complex" && !elementNode.isArray && (
          <IconButton
            icon={IconNames.CODE_BLOCK}
            onClick={handleAddExtensionClick}
          />
        )}
      </div>
      <SliceNameDialog
        onSubmit={handleAddSlice}
        open={isSliceDialogOpen}
        onClose={handleSliceDialogClose}
      />
    </>
  );
};

export default TreeItemLabel;
