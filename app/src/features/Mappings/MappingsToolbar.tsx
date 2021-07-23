import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router";

import Button from "common/components/Button";
import { useApiResourcesListQuery } from "services/api/endpoints";

const useStyles = makeStyles((theme) => ({
  rowContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: theme.mixins.icons.size,
    height: theme.mixins.icons.size,
    marginRight: theme.spacing(0.5),
    fill: theme.palette.text.secondary,
  },
}));

const MappingsToolbar = (): JSX.Element => {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation();

  const { sourceId } = useParams<{ sourceId?: string }>();

  const { data: mappings } = useApiResourcesListQuery({ source: sourceId });

  const handleCreateMappingClick = () => {
    history.push(`/sources/${sourceId}/mappings`);
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
          size="small"
          onClick={handleCreateMappingClick}
        >
          <Typography>{t("newMapping")}</Typography>
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
    </Grid>
  );
};

export default MappingsToolbar;
