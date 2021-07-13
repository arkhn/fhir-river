import React, { useRef } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { CircularProgress, Typography, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import Button from "common/components/Button";
import { useApiSourcesExportRetrieveQuery } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(0.5),
  },
}));

const SourceExportButton = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const exportButtonRef = useRef<HTMLAnchorElement | null>(null);
  const { sourceId } = useParams<{ sourceId?: string }>();

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
  );
};

export default SourceExportButton;
