import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Container, makeStyles, Typography } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { TreeView, TreeItem } from "@material-ui/lab";
import clsx from "clsx";

import useFhirResourceTreeData, {
  ElementNode,
} from "common/hooks/useFhirResourceTreeData";

import { fhirResourcePat as fhirResource } from "./fhirResource";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
  },
  flameIcon: {
    fill: "#CC7831",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingBlock: theme.spacing(2),
  },
  headerTitle: {
    fontWeight: 500,
  },
}));

const ElementNodeTreeItem = (elementNode: ElementNode): JSX.Element => (
  <TreeItem nodeId={elementNode.id} label={elementNode.name}>
    {Array.isArray(elementNode.children)
      ? elementNode.children.map((node) => (
          <ElementNodeTreeItem key={node.id} {...node} />
        ))
      : null}
  </TreeItem>
);

const FhirResourceTree = (): JSX.Element => {
  const classes = useStyles();
  const elementNodes = useFhirResourceTreeData();

  console.log(elementNodes);

  return (
    <Container>
      <div className={classes.header}>
        <Icon
          icon={IconNames.FLAME}
          className={clsx(classes.icon, classes.flameIcon)}
          iconSize={15}
        />
        <Typography className={classes.headerTitle} color="textPrimary">
          {fhirResource.id}
        </Typography>
      </div>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {elementNodes.map((node: ElementNode) => (
          <ElementNodeTreeItem key={node.id} {...node} />
        ))}
      </TreeView>
    </Container>
  );
};

export default FhirResourceTree;
