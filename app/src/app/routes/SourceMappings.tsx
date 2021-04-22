import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Button,
  Container,
  Drawer,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useParams } from "react-router-dom";

import MappingsTable from "features/Mappings/MappingsTable";
import MappingsToolbar from "features/Mappings/MappingsToolbar";
import NavigationBreadcrumbs from "features/NavigationBreadcrumbs/NavigationBreadcrumbs";
import CredentialForm from "features/Sources/CredentialForm";
import { useApiSourcesRetrieveQuery } from "services/api/endpoints";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    margin: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    textTransform: "none",
  },
  icon: {
    fill: theme.palette.getContrastText(theme.palette.background.paper),
  },
}));

const SourceMappings = (): JSX.Element => {
  const classes = useStyles();
  const { sourceId } = useParams<{ sourceId?: string }>();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { data: source } = useApiSourcesRetrieveQuery(
    { id: sourceId ?? "" },
    { skip: !sourceId }
  );

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <Container maxWidth="xl">
        <div className={classes.header}>
          <NavigationBreadcrumbs />
          <Grid>
            <Button
              size="small"
              variant="contained"
              className={classes.button}
              startIcon={<Icon icon={IconNames.COG} className={classes.icon} />}
              onClick={handleDrawerOpen}
            >
              <Typography>Database settings</Typography>
            </Button>
            <Button
              size="small"
              variant="contained"
              className={classes.button}
              startIcon={
                <Icon icon={IconNames.EXPORT} className={classes.icon} />
              }
            >
              <Typography>Export mapping</Typography>
            </Button>
            <Button
              size="small"
              variant="contained"
              className={classes.button}
              startIcon={
                <Icon icon={IconNames.FLAME} className={classes.icon} />
              }
            >
              <Typography>Launch ETL</Typography>
            </Button>
          </Grid>
        </div>
        <Container maxWidth="xl">
          <MappingsToolbar />
          <MappingsTable />
        </Container>
      </Container>
      <Drawer open={isDrawerOpen} onClose={handleDrawerClose} anchor="right">
        {source && (
          <CredentialForm source={source} onSuccess={handleDrawerClose} />
        )}
      </Drawer>
    </>
  );
};

export default SourceMappings;
