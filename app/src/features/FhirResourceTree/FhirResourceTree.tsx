import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Container,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { TreeView } from "@material-ui/lab";
import clsx from "clsx";
import { useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "app/store";
import useFhirResourceTreeData from "common/hooks/useFhirResourceTreeData";
import {
  useApiAttributesCreateMutation,
  useApiResourcesRetrieveQuery,
  useApiAttributesListQuery,
} from "services/api/endpoints";

import { nodeSelected } from "./resourceTreeSlice";
import { getNode } from "./resourceTreeUtils";
import TreeItem from "./TreeItem";

const useStyles = makeStyles((theme) => ({
  icon: {
    fill: theme.palette.text.secondary,
    color: theme.palette.text.secondary,
    paddingInline: theme.spacing(0.5),
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
    paddingLeft: theme.spacing(1),
    fontWeight: 500,
    flex: 1,
  },
}));

const FhirResourceTree = (): JSX.Element => {
  const classes = useStyles();
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const { mappingId } = useParams<{ mappingId?: string }>();
  const dispatch = useAppDispatch();
  const selectedNodeId = useAppSelector(
    (state) => state.resourceTree.selectedNodeId
  );
  const { data: mapping } = useApiResourcesRetrieveQuery(
    {
      id: mappingId ?? "",
    },
    { skip: !mappingId }
  );
  const { root, addExtension } = useFhirResourceTreeData(
    {
      definitionId: mapping?.definition_id ?? "",
    },
    { skip: !mapping }
  );
  const { data: mappingAttributes } = useApiAttributesListQuery(
    { resource: mapping?.id ?? "" },
    { skip: !mapping }
  );
  const [createAttribute] = useApiAttributesCreateMutation();

  const handleSelectNode = (_: React.ChangeEvent<unknown>, id: string) => {
    const node = root && getNode("id", id, root);
    if (node && node.kind === "primitive" && !node.isArray) {
      dispatch(nodeSelected(id));

      if (
        node.type &&
        mapping &&
        mappingAttributes &&
        !mappingAttributes.find(({ path }) => path === node.path)
      ) {
        createAttribute({
          attributeRequest: {
            definition_id: node.type,
            path: node.path,
            resource: mapping.id,
          },
        });
      }
    }
  };
  const handleExpandNode = (
    _: React.ChangeEvent<unknown>,
    nodeIds: string[]
  ) => {
    setExpandedNodes(nodeIds);
  };
  const handleAddExtensionClick = () => {
    addExtension();
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
        <IconButton onClick={handleAddExtensionClick} size="small">
          <Icon
            className={classes.icon}
            icon={IconNames.CODE_BLOCK}
            iconSize={15}
          />
        </IconButton>
      </div>
      <TreeView
        selected={selectedNodeId ?? ""}
        expanded={expandedNodes}
        onNodeToggle={handleExpandNode}
        onNodeSelect={handleSelectNode}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {root?.children.map((node) => (
          <TreeItem key={node.id} elementNode={node} hasParentExpanded />
        ))}
      </TreeView>
    </Container>
  );
};

export default FhirResourceTree;
