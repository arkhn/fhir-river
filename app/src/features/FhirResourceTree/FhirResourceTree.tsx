import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Container, makeStyles, Typography } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { TreeView, TreeItem } from "@material-ui/lab";
import clsx from "clsx";
import { useParams } from "react-router-dom";

import useFhirResourceTreeData, {
  ElementNode,
} from "common/hooks/useFhirResourceTreeData";
import { useApiResourcesRetrieveQuery } from "services/api/endpoints";

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
  const { mappingId } = useParams<{ mappingId?: string }>();
  const { data: mapping } = useApiResourcesRetrieveQuery(
    {
      id: mappingId ?? "",
    },
    { skip: !mappingId }
  );
  const { data: elementNodes } = useFhirResourceTreeData({
    id: mapping?.definition_id ?? "",
  });

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
          {mapping?.definition_id}
        </Typography>
      </div>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {elementNodes &&
          elementNodes.map((node: ElementNode) => (
            <ElementNodeTreeItem key={node.id} {...node} />
          ))}
      </TreeView>
    </Container>
  );
};

export default FhirResourceTree;
