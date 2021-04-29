import React, { useEffect, useState } from "react";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { FetchBaseQueryError } from "@rtk-incubator/rtk-query/dist";
import clsx from "clsx";
import { head } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Alert from "common/components/Alert";
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
    textTransform: "none",
  },
  previousButton: {
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "inherit",
      color: theme.palette.text.primary,
    },
  },
}));

const MappingNameDialog = (props: DialogProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [alert, setAlert] = useState<string | undefined>(undefined);
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

  const handleAlertClose = () => setAlert(undefined);
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
        setAlert(head(data?.non_field_errors));
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
              className={clsx(classes.button, classes.previousButton)}
              disableRipple
              onClick={handleClose}
            >
              <Typography>{t("cancel")}</Typography>
            </Button>
            <Button
              className={classes.button}
              color="primary"
              variant="contained"
              onClick={handleSubmit}
              disabled={isUpdateLoading}
            >
              {isUpdateLoading ? (
                <CircularProgress />
              ) : (
                <Typography>{t("confirm")}</Typography>
              )}
            </Button>
          </DialogActions>
          <Alert
            severity="error"
            open={!!alert}
            onClose={handleAlertClose}
            message={alert}
          />
        </>
      )}
    </Dialog>
  );
};

export default MappingNameDialog;
