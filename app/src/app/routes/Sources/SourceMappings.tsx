import React, { useRef } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Button,
  CircularProgress,
  Container,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useParams } from "react-router";

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

  return (
    <>
      <Container maxWidth="xl">
        <div className={classes.header}>
          <NavigationBreadcrumbs />
          <Grid>
            <CredentialEditButton
              size="small"
              variant="contained"
              className={classes.button}
              startIcon={<Icon icon={IconNames.COG} className={classes.icon} />}
            />
            <Button
              size="small"
              variant="contained"
              ref={exportButtonRef}
              component="a"
              className={classes.button}
              disabled={isSerializedSourceLoading}
              startIcon={
                <Icon icon={IconNames.EXPORT} className={classes.icon} />
              }
              onClick={handleExportMappingClick}
            >
              {isSerializedSourceLoading && <CircularProgress size="small" />}
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
      <SourceDrawer />
    </>
  );
};

export default SourceMappings;
