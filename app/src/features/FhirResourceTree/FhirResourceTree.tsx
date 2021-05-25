import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Container, makeStyles, Typography } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { TreeView } from "@material-ui/lab";
import clsx from "clsx";
import { useParams } from "react-router-dom";

import useFhirResourceTreeData from "common/hooks/useFhirResourceTreeData";
import { useApiResourcesRetrieveQuery } from "services/api/endpoints";

import { getNode } from "./resourceTreeSlice";
import TreeItem from "./TreeItem";

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

const FhirResourceTree = (): JSX.Element => {
  const classes = useStyles();
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const { mappingId } = useParams<{ mappingId?: string }>();
  const { data: mapping } = useApiResourcesRetrieveQuery(
    {
      id: mappingId ?? "",
    },
    { skip: !mappingId }
  );
  const { root } = useFhirResourceTreeData(
    {
      definitionId: mapping?.definition_id ?? "",
    },
    { skip: !mapping }
  );

  const handleSelectNode = (_: React.ChangeEvent<unknown>, id: string) => {
    const node = root && getNode("id", id, root);
    if (node && node.kind === "primitive" && !node.isArray) {
      setSelectedNode(id);
    }
  };
  const handleExpandNode = (
    _: React.ChangeEvent<unknown>,
    nodeIds: string[]
  ) => {
    setExpandedNodes(nodeIds);
  };

  return (
    <Container>
      <div className={classes.header}>
        <Icon
          icon={IconNames.FLAME}
          className={clsx(classes.icon, classes.flameIcon)}
          iconSize={15}
        />
        <Typography className={classes.headerTitle} color="textPrimary">
          {mapping?.definition_id}
        </Typography>
      </div>
      <TreeView
        selected={selectedNode}
        expanded={expandedNodes}
        onNodeToggle={handleExpandNode}
        onNodeSelect={handleSelectNode}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {root?.children.map((node) => (
          <TreeItem key={node.id} elementNode={node} />
        ))}
      </TreeView>
    </Container>
  );
};

export default FhirResourceTree;
