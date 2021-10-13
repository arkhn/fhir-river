import React, { ChangeEvent, useRef, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { makeStyles } from "@material-ui/core";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import { useApiProjectsImportCreateMutation } from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";
import { MappingRequest } from "services/api/generated/api.generated";

import CredentialDialog from "./CredentialDialog";

const useStyles = makeStyles((theme) => ({
  fileInput: {
    display: "none",
  },
  button: {
    marginLeft: theme.spacing(3),
    width: "auto",
    "& svg": {
      fill: theme.palette.text.primary,
    },
  },
}));

type CredentialFormInputs = Omit<MappingRequest["credential"], "owners">;

const UploadProjectButton = (): JSX.Element => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mappingRequest, setMappingRequest] = useState<
    MappingRequest | undefined
  >();
  const [apiProjectImportCreate] = useApiProjectsImportCreateMutation();

  let fileReader: FileReader | null = null;

  const handleFileRead = () => {
    const content = fileReader?.result;
    if (content) {
      const parsedContent = JSON.parse(content as string) as MappingRequest;
      setMappingRequest(parsedContent);

      //Clear input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      fileReader = new FileReader();
      fileReader.onloadend = handleFileRead;
      fileReader.readAsText(file);
    }
  };
  const handleDialogClose = () => {
    setMappingRequest(undefined);
  };
  const handleCredentialSubmit = async (
    credentialInputs: CredentialFormInputs
  ) => {
    if (mappingRequest) {
      try {
        await apiProjectImportCreate({
          mappingRequest: {
            ...mappingRequest,
            credential: { ...credentialInputs, ...mappingRequest.credential },
          },
        }).unwrap();
        setMappingRequest(undefined);
      } catch (error) {
        enqueueSnackbar(error.error, { variant: "error" });
        const errorData = apiValidationErrorFromResponse(
          error as FetchBaseQueryError
        );
        if (errorData) {
          const errorMessage = Object.entries(errorData).reduce(
            (acc, [key, value]) => `${acc} ${key}: ${value}`,
            ""
          );
          enqueueSnackbar(errorMessage, { variant: "error" });
        }
      }
    }
  };

  return (
    <>
      <label>
        <input
          className={classes.fileInput}
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
        />
        <Button
          component="div"
          className={classes.button}
          variant="outlined"
          fullWidth={false}
          startIcon={<Icon icon={IconNames.IMPORT} />}
        >
          {t("importProject")}
        </Button>
      </label>
      <CredentialDialog
        open={!!mappingRequest}
        onSubmit={handleCredentialSubmit}
        onClose={handleDialogClose}
        credential={mappingRequest?.credential}
      />
    </>
  );
};

export default UploadProjectButton;
