import React, { useState } from "react";

import { makeStyles } from "@material-ui/core";
import { TreeItem as MuiTreeItem } from "@material-ui/lab";
import clsx from "clsx";

import { ElementNode } from "./resourceTreeSlice";
import TreeItemLabel from "./TreeItemLabel";
import useFhirResourceTreeData from "./useFhirResourceTreeData";

type TreeItemProps = {
  elementNode: ElementNode;
  isArrayItem?: boolean;
  hasParentExpanded?: boolean;
};

const useStyle = makeStyles((theme) => ({
  root: {
    "& .MuiTreeItem-content .MuiTreeItem-label": {
      borderRadius: 4,
      padding: `0px ${theme.spacing(1)}px`,
      height: theme.spacing(4),
    },
    "&.MuiTreeItem-root.Mui-selected > .MuiTreeItem-content ": {
      "& .MuiTreeItem-label": {
        backgroundColor: theme.palette.orange.transparent.light,
      },
      "& .MuiTreeItem-label:hover, .MuiTreeItem-root.Mui-selected:focus > .MuiTreeItem-content .MuiTreeItem-label": {
        backgroundColor: theme.palette.orange.transparent.main,
      },
    },
  },
  hidden: {
    display: "none",
  },
}));

const TreeItem = ({
  elementNode,
  isArrayItem,
  hasParentExpanded,
}: TreeItemProps): JSX.Element => {
  const classes = useStyle();
  const isNodeHidden =
    elementNode.type === "Extension" &&
    elementNode.isArray &&
    elementNode.children.length === 0;
  const [hasExpanded, setHasExpanded] = useState(false);
  const isComplex = elementNode.kind === "complex";
  const hasToFetchNodeDefinition =
    isComplex &&
    hasParentExpanded &&
    !elementNode.isArray &&
    elementNode.definitionNode.childrenDefinitions.filter(
      ({ definition }) => !definition.sliceName
    ).length === 0;
  const { createItem, deleteItem, addExtension } = useFhirResourceTreeData(
    {
      definitionId: elementNode.type ?? "",
      node: elementNode,
    },
    {
      skip: !hasToFetchNodeDefinition,
    }
  );

  const handleIconClick = () => {
    setHasExpanded(true);
  };
  const handleLabelClick = () => {
    setHasExpanded(true);
  };

  return (
    <MuiTreeItem
      nodeId={elementNode.path}
      className={clsx(classes.root, { [classes.hidden]: isNodeHidden })}
      label={
        <TreeItemLabel
          isArrayItem={isArrayItem}
          elementNode={elementNode}
          onDeleteItem={deleteItem}
          onCreateItem={createItem}
          onAddExtension={addExtension}
        />
      }
      onIconClick={handleIconClick}
      onLabelClick={handleLabelClick}
    >
      {elementNode.children.length > 0 &&
        elementNode.children.map((childElementNode) => (
          <TreeItem
            key={childElementNode.path}
            elementNode={childElementNode}
            isArrayItem={elementNode.isArray}
            hasParentExpanded={hasExpanded}
          />
        ))}
    </MuiTreeItem>
  );
};

export default TreeItem;
