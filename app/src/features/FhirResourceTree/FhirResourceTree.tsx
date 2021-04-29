import React from "react";

import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Container, makeStyles, Typography } from "@material-ui/core";
import { TreeView, TreeItem } from "@material-ui/lab";
import clsx from "clsx";
import { useParams } from "react-router";
import { v4 as uuid } from "uuid";

import useFhirResourceTreeData from "common/hooks/useFhirResourceTreeData";

import { fhirResource } from "./fhirResource";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
  },
  flameIcon: {
    fill: "#CC7831",
  },
  resourceId: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
}));

const FhirResourceTree = (): JSX.Element => {
  const { mappingId } = useParams<{ mappingId?: string }>();
  const classes = useStyles();
  console.log(mappingId);
  useFhirResourceTreeData();

  return (
    <Container>
      <div className={classes.resourceId}>
        <Icon
          icon={IconNames.FLAME}
          className={clsx(classes.icon, classes.flameIcon)}
          iconSize={15}
        />
        <Typography>{fhirResource.id}</Typography>
      </div>
      <TreeView>
        {fhirResource.snapshot?.element.map((element: IElementDefinition) => (
          <TreeItem nodeId={"1"} label={element.id} key={uuid()} />
        ))}
      </TreeView>
    </Container>
  );
};

export default FhirResourceTree;
