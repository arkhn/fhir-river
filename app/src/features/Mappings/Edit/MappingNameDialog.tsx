import React, { useEffect, useState } from "react";

import {
  CircularProgress,
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  makeStyles,
} from "@material-ui/core";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { head } from "lodash";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Button from "common/components/Button";
import {
  useApiResourcesRetrieveQuery,
  useApiResourcesUpdateMutation,
} from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";
import { ResourceRequest } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(2),
  },
}));

const MappingNameDialog = (props: DialogProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const { mappingId } = useParams<{
    mappingId?: string;
  }>();
  const {
    data: mapping,
    isLoading: isMappingLoading,
  } = useApiResourcesRetrieveQuery(
    {
      id: mappingId ?? "",
    },
    { skip: !mappingId }
  );
  const [
    updateMapping,
    { isLoading: isUpdateLoading },
  ] = useApiResourcesUpdateMutation({});

  useEffect(() => {
    setName(mapping?.label ?? "");
  }, [mapping]);

  const handleNameChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setName(event.target.value);
  };
  const handleSubmit = async () => {
    if (mapping) {
      try {
        await updateMapping({
          id: mapping.id,
          resourceRequest: {
            ...mapping,
            label: name,
          },
        }).unwrap();
        props.onClose && props.onClose({}, "escapeKeyDown");
      } catch (e) {
        const data = apiValidationErrorFromResponse<Partial<ResourceRequest>>(
          e as FetchBaseQueryError
        );
        enqueueSnackbar(head(data?.non_field_errors), { variant: "error" });
      }
    }
  };
  const handleClose = () => {
    props.onClose && props.onClose({}, "escapeKeyDown");
  };

  return (
    <Dialog
      maxWidth="sm"
      PaperProps={{ className: classes.root }}
      {...props}
      fullWidth
    >
      {isMappingLoading && !mapping ? (
        <CircularProgress />
      ) : (
        <>
          <DialogTitle>{t("mappingName")}</DialogTitle>
          <DialogContent>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={name}
              onChange={handleNameChange}
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button
              className={classes.button}
              color="inherit"
              disableRipple
              onClick={handleClose}
            >
              {t("cancel")}
            </Button>
            <Button
              className={classes.button}
              color="primary"
              variant="contained"
              onClick={handleSubmit}
              disabled={isUpdateLoading}
            >
              {isUpdateLoading ? <CircularProgress /> : t("confirm")}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default MappingNameDialog;
