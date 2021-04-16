import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import AttributeIcon from "@material-ui/icons/LocalOffer";
import { useParams, useHistory } from "react-router";

import {
  useListSourceAttributes,
  useListSourceResources,
  useRetrieveSourceQuery,
} from "services/api/api";

const useStyles = makeStyles((theme) => ({
  rowContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    textTransform: "none",
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: theme.spacing(0.5),
    fill: theme.palette.text.secondary,
  },
}));

const MappingsToolbar = (): JSX.Element => {
  const classes = useStyles();
  const history = useHistory();
  const { sourceId } = useParams<{ sourceId?: string }>();

  const { data: source } = useRetrieveSourceQuery(
    { id: sourceId ?? "" },
    { skip: !sourceId }
  );
  const { data: mappings } = useListSourceResources(source);
  const { data: attributes } = useListSourceAttributes(source);

  const handleCreateMappingClick = () => {
    history.push(`/source/${sourceId}/mapping`);
  };

  return (
    <Grid
      className={classes.rowContainer}
      container
      spacing={3}
      alignItems="center"
    >
      <Grid item>
        <Button
          color="primary"
          variant="contained"
          className={classes.button}
          size="small"
          onClick={handleCreateMappingClick}
        >
          <Typography>New mapping</Typography>
        </Button>
      </Grid>
      <Grid item className={classes.rowContainer}>
        <Icon
          icon={IconNames.DIAGRAM_TREE}
          className={classes.icon}
          iconSize={13}
        />
        <Typography color="textSecondary">
          {mappings ? `${mappings.length} mappings` : "-"}
        </Typography>
      </Grid>
      <Grid item className={classes.rowContainer}>
        <AttributeIcon className={classes.icon} />
        <Typography color="textSecondary">
          {attributes ? `${attributes.length} attributes` : "-"}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default MappingsToolbar;
