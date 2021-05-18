import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { Typography } from "@material-ui/core";
import { TreeItem as MuiTreeItem } from "@material-ui/lab";

import useFhirResourceTreeData from "common/hooks/useFhirResourceTreeData";

import { ElementNode } from "./resourceTreeSlice";

type TreeItemProps = {
  elementNode: ElementNode;
};

const TreeItem = ({ elementNode }: TreeItemProps): JSX.Element => {
  const [hasExpanded, setHasExpanded] = useState(false);
  const isPrimitive = elementNode.kind === "primitive";
  const isComplex = elementNode.kind === "complex";
  useFhirResourceTreeData(
    { id: elementNode.type ?? "", nodeId: elementNode.id },
    { skip: !isComplex || !hasExpanded }
  );

  const handleIconClick = () => {
    setHasExpanded(true);
  };
  const handleLabelClick = (event: React.MouseEvent<Element>) => {
    event.preventDefault();
  };

  let iconName: IconName | null = null;

  switch (elementNode.kind) {
    case "primitive":
      iconName = IconNames.TAG;
      break;
    case "complex":
    case "choice":
      iconName = IconNames.FOLDER_OPEN;
      break;
    case "array":
      iconName = IconNames.LAYERS;
      break;

    default:
      break;
  }

  return (
    <MuiTreeItem
      nodeId={elementNode.id}
      label={
        <>
          {iconName && <Icon icon={iconName} color="white" iconSize={15} />}
          <Typography display="inline" color="textPrimary">
            {elementNode.name}
          </Typography>
          <Typography
            display="inline"
            variant="subtitle2"
            color="textSecondary"
          >
            {elementNode.type}
          </Typography>
        </>
      }
      onIconClick={handleIconClick}
      onLabelClick={handleLabelClick}
    >
      {elementNode.children.length > 0
        ? elementNode.children.map((node) => (
            <TreeItem key={node.id} elementNode={node} />
          ))
        : !isPrimitive && <div key="stub" />}
    </MuiTreeItem>
  );
};

export default TreeItem;
