/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ChangeEvent, useRef, useState } from "react";

import { Button, Typography, makeStyles } from "@material-ui/core";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import Alert from "common/components/Alert";
import { useApiSourcesImportCreateMutation } from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";

import { sourceEdited } from "./sourceSlice";

const useStyles = makeStyles((theme) => ({
  fileInput: {
    display: "none",
  },
  button: {
    marginLeft: theme.spacing(3),
    textTransform: "none",
    width: "auto",
    minWidth: 150,
  },
}));

const UploadSourceButton = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const [apiSourceImportCreate] = useApiSourcesImportCreateMutation();

  let fileReader: FileReader | null = null;

  const handleAlertClose = () => setAlert(undefined);
  const handleFileRead = async () => {
    const content = fileReader?.result;
    if (content) {
      const parsedContent = JSON.parse(content as string);
      try {
        const {
          created_at,
          id,
          name,
          updated_at,
          users,
        } = await apiSourceImportCreate({
          mappingRequest: parsedContent,
        }).unwrap();
        dispatch(
          sourceEdited({
            created_at,
            id,
            name,
            updated_at,
            users: users?.map(({ id }) => id) || [],
          })
        );
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

  return (
    <label>
      <input
        className={classes.fileInput}
        ref={fileInputRef}
        // disabled={isLoading}
        type="file"
        accept=".json"
        onChange={handleFileChange}
      />
      <Button
        component="div"
        className={classes.button}
        variant="contained"
        color="primary"
        fullWidth={false}
      >
        <Typography>{t("importSource")}</Typography>
      </Button>
      <Alert
        severity="error"
        open={!!alert}
        onClose={handleAlertClose}
        message={alert}
      />
    </label>
  );
};

export default UploadSourceButton;
