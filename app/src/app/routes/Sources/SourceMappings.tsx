import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Container, Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import MappingsTable from "features/Mappings/MappingsTable";
import MappingsToolbar from "features/Mappings/MappingsToolbar";
import NavigationBreadcrumbs from "features/NavigationBreadcrumbs/NavigationBreadcrumbs";
import CredentialEditButton from "features/Sources/CredentialEditButton";
import SourceDrawer from "features/Sources/SourceDrawer";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    margin: theme.spacing(0.5),
  },
}));

const SourceMappings = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <Container maxWidth="xl">
        <div className={classes.header}>
          <NavigationBreadcrumbs />
          <Grid>
            <CredentialEditButton
              variant="contained"
              className={classes.button}
              color="secondary"
              startIcon={<Icon icon={IconNames.COG} />}
            >
              {t("databaseSettings")}
            </CredentialEditButton>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<Icon icon={IconNames.EXPORT} />}
            >
              {t("exportMapping")}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<Icon icon={IconNames.FLAME} />}
            >
              {t("launchEtl")}
            </Button>
          </Grid>
        </div>
        <Container maxWidth="xl">
          <MappingsToolbar />
          <MappingsTable />
        </Container>
      </Container>
      <SourceDrawer />
    </>
  );
};

export default SourceMappings;
