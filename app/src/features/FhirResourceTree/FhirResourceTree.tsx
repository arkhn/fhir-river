import React, { useState, useEffect } from "react";

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
import { difference } from "lodash";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router-dom";

import useGetSelectedNode from "common/hooks/useGetSelectedNode";
import {
  useApiAttributesCreateMutation,
  useApiResourcesRetrieveQuery,
  useApiAttributesListQuery,
  useApiInputGroupsCreateMutation,
  useApiStaticInputsCreateMutation,
} from "services/api/endpoints";

import { getElementNodeByPath } from "./resourceTreeUtils";
import TreeItem from "./TreeItem";
import useFhirResourceTreeData from "./useFhirResourceTreeData";
import useGetSelectedAttributeAncestors from "./useGetSelectedAttributeAncestors";

const useStyles = makeStyles((theme) => ({
  icon: {
    fill: theme.palette.icons.resourceTree.light,
    paddingInline: theme.spacing(0.5),
  },
  flameIcon: {
    fill: theme.palette.orange.main,
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
  const history = useHistory();
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [hasAlreadyExpandedToTarget, setHasAlreadyExpandedToTarget] = useState(
    false
  );
  const { projectId, mappingId } = useParams<{
    projectId?: string;
    mappingId?: string;
  }>();
  const { data: mapping } = useApiResourcesRetrieveQuery(
    {
      id: mappingId ?? "",
    },
    { skip: !mappingId }
  );
  const { rootElementNode, addExtension } = useFhirResourceTreeData(
    {
      definitionId: mapping?.definition_id ?? "",
    },
    { skip: !mapping }
  );
  const { data: mappingAttributes } = useApiAttributesListQuery(
    { resource: mapping?.id ?? "" },
    { skip: !mapping }
  );
  const nodeAncestorsIds = useGetSelectedAttributeAncestors();
  const [createAttribute] = useApiAttributesCreateMutation();
  const [createInputGroup] = useApiInputGroupsCreateMutation();
  const [createStaticInput] = useApiStaticInputsCreateMutation();
  const selectedNode = useGetSelectedNode();

  // Expand attribute ancestors nodes only once
  useEffect(() => {
    const nodesToExpand = difference(nodeAncestorsIds, expandedNodes);

    if (nodesToExpand.length > 0 && !hasAlreadyExpandedToTarget) {
      setExpandedNodes([...expandedNodes, ...nodesToExpand]);
      setHasAlreadyExpandedToTarget(true);
    }
  }, [expandedNodes, hasAlreadyExpandedToTarget, nodeAncestorsIds]);

  const handleSelectNode = async (
    _: React.ChangeEvent<unknown>,
    nodePath: string
  ) => {
    const node =
      rootElementNode && getElementNodeByPath(nodePath, rootElementNode);
    if (
      node &&
      node.kind === "primitive" &&
      !node.isArray &&
      node.type &&
      mapping &&
      mappingAttributes
    ) {
      const selectedNodeAttribute = mappingAttributes.find(
        ({ path }) => path === node.path
      );
      if (!selectedNodeAttribute) {
        try {
          const attribute = await createAttribute({
            attributeRequest: {
              definition_id: node.type,
              path: node.path,
              resource: mapping.id,
            },
          }).unwrap();
          const inputGroup = await createInputGroup({
            inputGroupRequest: { attribute: attribute.id },
          }).unwrap();
          const isNodeTypeURI = node?.type === "uri";
          const isNodeNameType = node?.name === "type";
          // Create a static input for node of type "URI" & name "type"
          if (isNodeTypeURI && isNodeNameType) {
            createStaticInput({
              staticInputRequest: {
                input_group: inputGroup.id,
                value: "",
              },
            });
          }
          history.push(
            `/projects/${projectId}/mappings/${mappingId}/attributes/${attribute.id}`
          );
        } catch (error) {
          enqueueSnackbar(error.error, { variant: "error" });
        }
      } else {
        history.push(
          `/projects/${projectId}/mappings/${mappingId}/attributes/${selectedNodeAttribute.id}`
        );
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
          {rootElementNode?.definitionNode.definition.id}
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
        selected={selectedNode?.path ?? ""}
        expanded={expandedNodes}
        onNodeToggle={handleExpandNode}
        onNodeSelect={handleSelectNode}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {rootElementNode?.children.map((node) => (
          <TreeItem
            key={node.path}
            elementNode={node}
            hasParentExpanded
            expandedNodes={expandedNodes}
          />
        ))}
      </TreeView>
    </Container>
  );
};

export default FhirResourceTree;
