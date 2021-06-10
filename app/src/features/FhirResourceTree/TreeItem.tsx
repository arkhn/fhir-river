import React, { useState } from "react";

import { makeStyles } from "@material-ui/core";
import { TreeItem as MuiTreeItem } from "@material-ui/lab";
import clsx from "clsx";

import useFhirResourceTreeData from "common/hooks/useFhirResourceTreeData";

import { ElementNode } from "./resourceTreeSlice";
import TreeItemLabel from "./TreeItemLabel";

type TreeItemProps = {
  elementNode: ElementNode;
  isArrayItem?: boolean;
};

const useStyle = makeStyles(() => ({
  root: {
    "& .MuiTreeItem-content .MuiTreeItem-label": {
      borderRadius: 4,
      height: 32,
      paddingLeft: 10,
    },
  },
  hidden: {
    display: "none",
  },
}));

const TreeItem = ({ elementNode, isArrayItem }: TreeItemProps): JSX.Element => {
  const classes = useStyle();

  const isNodeHidden =
    elementNode.type === "Extension" &&
    elementNode.isArray &&
    elementNode.children.length === 0;
  const [hasExpanded, setHasExpanded] = useState(false);
  const isPrimitive = elementNode.kind === "primitive";
  const isComplex = elementNode.kind === "complex";
  const { createItem, deleteItem, addExtension } = useFhirResourceTreeData(
    {
      definitionId: elementNode.type ?? "",
      node: elementNode,
    },
    {
      skip:
        !isComplex ||
        !hasExpanded ||
        elementNode.isArray ||
        elementNode.type === "BackboneElement",
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
      nodeId={elementNode.id}
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
      {elementNode.children.length > 0
        ? elementNode.children.map((node) => (
            <TreeItem
              key={node.id}
              elementNode={node}
              isArrayItem={elementNode.isArray}
            />
          ))
        : !isPrimitive && !elementNode.isArray && <></>}
    </MuiTreeItem>
  );
};

export default TreeItem;
