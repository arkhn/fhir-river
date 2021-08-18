import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Container, Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router";

import Button from "common/components/Button";
import MappingsTable from "features/Mappings/MappingsTable";
import MappingsToolbar from "features/Mappings/MappingsToolbar";
import Navbar from "features/Navbar/Navbar";
import CredentialEditButton from "features/Sources/CredentialEditButton";
import SourceDrawer from "features/Sources/SourceDrawer";

import SourceExportButton from "./SourceExportButton";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(0, 5),
  },
  breadcrumbsButtons: {
    marginLeft: "auto",
  },
}));

const SourceMappings = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { sourceId } = useParams<{ sourceId?: string }>();

  const handleLaunchClick = () => {
    history.push(`/sources/${sourceId}/batches`);
  };

  return (
    <Container maxWidth="xl">
      <Navbar>
        <Grid container spacing={1} justify="flex-end">
          <Grid item>
            <CredentialEditButton
              variant="contained"
              color="secondary"
              startIcon={<Icon icon={IconNames.COG} />}
            />
          </Grid>
          <Grid item>
            <SourceExportButton />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Icon icon={IconNames.FLAME} />}
              onClick={handleLaunchClick}
            >
              {t("ETLDashboard")}
            </Button>
          </Grid>
        </Grid>
      </Navbar>
      <Container maxWidth="xl" className={classes.container}>
        <MappingsToolbar />
        <MappingsTable />
      </Container>
      <SourceDrawer />
    </Container>
  );
};

export default SourceMappings;
