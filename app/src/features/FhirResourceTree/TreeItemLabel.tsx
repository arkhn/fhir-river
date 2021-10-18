import React, { SyntheticEvent, useMemo } from "react";

import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { Icon } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import {
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  usePopupState,
  bindMenu,
  bindTrigger,
} from "material-ui-popup-state/hooks";
import { useTranslation } from "react-i18next";

import IconButton from "common/components/IconButton";
import useGetNodeItemAttributes from "common/hooks/useGetNodeItemAttributes";

import { ElementNode } from "./resourceTreeSlice";
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
    marginRight: theme.spacing(1),
  },
  treeItemTitle: {
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
  const nodeChildItemAttributes = useGetNodeItemAttributes(elementNode);
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popup-${elementNode.id}`,
  });
  // [itemDefinition, ...sliceDefinitions]
  const nodeDefinitions = useMemo(
    () => [
      elementNode.definitionNode.definition,
      ...elementNode.definitionNode.sliceDefinitions.map(
        ({ definition }) => definition
      ),
    ],
    [
      elementNode.definitionNode.definition,
      elementNode.definitionNode.sliceDefinitions,
    ]
  );
  const hasElementNodeSliceDefinitions =
    elementNode.definitionNode.sliceDefinitions.length > 0;

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

  const handleStopPropagation = (e: SyntheticEvent) => e.stopPropagation();

  const isMenuItemDisabled = (definition: IElementDefinition): boolean => {
    const definitionChildItemsLength =
      nodeChildItemAttributes?.filter(
        ({ slice_name }) => slice_name === (definition.sliceName ?? "")
      ).length ?? 0;
    const hasItemCountLimitBeenReached =
      definition.max !== undefined &&
      definition.max !== "*" &&
      definitionChildItemsLength >= +definition.max;
    return hasItemCountLimitBeenReached;
  };

  const handleDeleteItemClick = () => {
    onDeleteItem();
  };

  const handleAddExtensionClick = () => {
    onAddExtension();
  };

  const handlePoppupClose = () => {
    popupState.close();
  };

  const handleAddItemClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (hasElementNodeSliceDefinitions) {
      popupState.open(e);
    } else {
      onCreateItem();
    }
  };

  const handleAddItemOrSlice = (sliceName?: string) => () => {
    onCreateItem(sliceName);
    popupState.close();
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
      <div
        className={classes.treeItemContainer}
        onClick={handleStopPropagation}
      >
        {elementNode.kind === "complex" && !elementNode.isArray && (
          <Tooltip title={t<string>("addExtension")} arrow>
            <div>
              <IconButton
                icon={IconNames.CODE_BLOCK}
                onClick={handleAddExtensionClick}
              />
            </div>
          </Tooltip>
        )}
        {isArrayItem && (
          <Tooltip
            title={t<string>(
              elementNode.sliceName ? "deleteSlice" : "deleteItem"
            )}
            arrow
          >
            <div>
              <IconButton
                icon={IconNames.TRASH}
                onClick={handleDeleteItemClick}
              />
            </div>
          </Tooltip>
        )}
        {elementNode.isArray && elementNode.type !== "Extension" && (
          <>
            <Tooltip title={t<string>("addItem")} arrow>
              <div>
                <IconButton
                  icon={IconNames.ADD}
                  {...bindTrigger(popupState)}
                  disabled={
                    !hasElementNodeSliceDefinitions &&
                    isMenuItemDisabled(elementNode.definitionNode.definition)
                  }
                  onClick={handleAddItemClick}
                />
              </div>
            </Tooltip>
            {hasElementNodeSliceDefinitions && (
              <Menu {...bindMenu(popupState)} onClose={handlePoppupClose}>
                {nodeDefinitions.map((definition) => (
                  <MenuItem
                    key={definition.id}
                    onClick={handleAddItemOrSlice(definition.sliceName)}
                    disabled={isMenuItemDisabled(definition)}
                  >
                    <>
                      <Icon
                        className={classes.icon}
                        icon={
                          definition.sliceName
                            ? IconNames.PIE_CHART
                            : IconNames.ADD
                        }
                        iconSize={15}
                      />
                      <Typography>
                        {definition.sliceName ?? t("item")}
                      </Typography>
                    </>
                  </MenuItem>
                ))}
              </Menu>
            )}
          </>
        )}
      </div>
      <TreeNodeBadge elementNode={elementNode} />
    </div>
  );
};

export default TreeItemLabel;
