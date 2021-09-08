import React, { ChangeEvent, useRef, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { makeStyles } from "@material-ui/core";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { useTranslation } from "react-i18next";

import Alert from "common/components/Alert";
import Button from "common/components/Button";
import { useApiSourcesImportCreateMutation } from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";
import { MappingRequest } from "services/api/generated/api.generated";

import CredentialDialog from "./CredentialDialog";

const useStyles = makeStyles((theme) => ({
  fileInput: {
    display: "none",
  },
  button: {
    marginLeft: theme.spacing(3),
    textTransform: "none",
    width: "auto",
    "& svg": {
      fill: theme.palette.text.primary,
    },
  },
}));

type CredentialFormInputs = Omit<MappingRequest["credential"], "owners">;

const UploadSourceButton = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [alert, setAlert] = useState<string | undefined>();
  const [mappingRequest, setMappingRequest] = useState<
    MappingRequest | undefined
  >();
  const [apiSourceImportCreate] = useApiSourcesImportCreateMutation();

  let fileReader: FileReader | null = null;

  const handleAlertClose = () => setAlert(undefined);
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
        await apiSourceImportCreate({
          mappingRequest: {
            ...mappingRequest,
            credential: { ...credentialInputs, ...mappingRequest.credential },
          },
        }).unwrap();
        setMappingRequest(undefined);
      } catch (error) {
        // TODO: Handle errors nicely
        console.error(error);
        const errorData = apiValidationErrorFromResponse(
          error as FetchBaseQueryError
        );
        if (errorData) {
          const errorMessage = Object.entries(errorData).reduce(
            (acc, [key, value]) => `${acc} ${key}: ${value}`,
            ""
          );
          setAlert(errorMessage);
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
          {t("importSource")}
        </Button>
      </label>
      <CredentialDialog
        open={!!mappingRequest}
        onSubmit={handleCredentialSubmit}
        onClose={handleDialogClose}
        credential={mappingRequest?.credential}
      />
      <Alert
        severity="error"
        open={!!alert}
        onClose={handleAlertClose}
        message={alert}
      />
    </>
  );
};

export default UploadSourceButton;
