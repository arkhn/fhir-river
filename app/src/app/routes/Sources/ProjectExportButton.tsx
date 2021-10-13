import React, { useRef } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import Button from "common/components/Button";
import { useApiProjectsExportRetrieveQuery } from "services/api/endpoints";

const ProjectExportButton = (props: MuiButtonProps): JSX.Element => {
  const { t } = useTranslation();
  const exportButtonRef = useRef<HTMLAnchorElement | null>(null);
  const { projectId } = useParams<{ projectId?: string }>();

  const {
    data: serializedProject,
    isLoading: isSerializedProjectLoading,
  } = useApiProjectsExportRetrieveQuery(
    { id: projectId ?? "" },
    { skip: !projectId, refetchOnMountOrArgChange: true }
  );

  const handleExportMappingClick = () => {
    if (serializedProject) {
      const data = `text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(serializedProject)
      )}`;

      if (exportButtonRef && exportButtonRef.current) {
        exportButtonRef.current.setAttribute("href", `data:${data}`);
        exportButtonRef.current.setAttribute(
          "download",
          `${serializedProject.name}.json`
        );
      }
    }
  };

  return (
    <Button
      {...props}
      component="a"
      variant="contained"
      color="secondary"
      startIcon={<Icon icon={IconNames.EXPORT} />}
      ref={exportButtonRef}
      disabled={isSerializedProjectLoading}
      onClick={handleExportMappingClick}
      disableElevation
    >
      {isSerializedProjectLoading && <CircularProgress size="small" />}
      <Typography>{t("exportMapping")}</Typography>
    </Button>
  );
};

export default ProjectExportButton;
