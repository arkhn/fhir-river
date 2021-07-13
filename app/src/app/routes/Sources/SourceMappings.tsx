import React, { useRef } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Container,
  Grid,
  makeStyles,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router";

import Button from "common/components/Button";
import MappingsTable from "features/Mappings/MappingsTable";
import MappingsToolbar from "features/Mappings/MappingsToolbar";
import NavigationBreadcrumbs from "features/NavigationBreadcrumbs/NavigationBreadcrumbs";
import CredentialEditButton from "features/Sources/CredentialEditButton";
import SourceDrawer from "features/Sources/SourceDrawer";
import { useApiSourcesExportRetrieveQuery } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: theme.mixins.breadcrumbBar.height,
    padding: theme.spacing(0, 5),
  },
  button: {
    margin: theme.spacing(0.5),
  },
  container: {
    padding: theme.spacing(0, 7),
  },
}));

const SourceMappings = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { sourceId } = useParams<{ sourceId?: string }>();

  const exportButtonRef = useRef<HTMLAnchorElement | null>(null);
  const {
    data: serializedSource,
    isLoading: isSerializedSourceLoading,
  } = useApiSourcesExportRetrieveQuery(
    { id: sourceId ?? "" },
    { skip: !sourceId }
  );

  const handleExportMappingClick = () => {
    if (serializedSource) {
      const data = `text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(serializedSource)
      )}`;

      if (exportButtonRef && exportButtonRef.current) {
        exportButtonRef.current.setAttribute("href", `data:${data}`);
        exportButtonRef.current.setAttribute(
          "download",
          `${serializedSource.name}.json`
        );
      }
    }
  };
  const handleLaunchClick = () => {
    history.push(`/sources/${sourceId}/batches`);
  };

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
            />
            <Button
              component="a"
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<Icon icon={IconNames.EXPORT} />}
              ref={exportButtonRef}
              disabled={isSerializedSourceLoading}
              onClick={handleExportMappingClick}
              disableElevation
            >
              {isSerializedSourceLoading && <CircularProgress size="small" />}
              <Typography>{t("exportMapping")}</Typography>
            </Button>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<Icon icon={IconNames.FLAME} />}
              onClick={handleLaunchClick}
            >
              <Typography>{t("launchETL")}</Typography>
            </Button>
          </Grid>
        </div>
        <Container maxWidth="xl" className={classes.container}>
          <MappingsToolbar />
          <MappingsTable />
        </Container>
      </Container>
      <SourceDrawer />
    </>
  );
};

export default SourceMappings;
