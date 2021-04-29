import React, { useState } from "react";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { FetchBaseQueryError } from "@rtk-incubator/rtk-query/dist";
import clsx from "clsx";
import { head } from "lodash";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import Alert from "common/components/Alert";
import { apiValidationErrorFromResponse } from "services/api/errors";
import {
  ResourceRequest,
  useApiResourcesDestroyMutation,
} from "services/api/generated/api.generated";

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
  error: {
    backgroundColor: theme.palette.error.main,
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

const MappingDeleteDialog = (props: DialogProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();
  const [
    deleteMapping,
    { isLoading: isDeleteLoading },
  ] = useApiResourcesDestroyMutation({});

  const handleAlertClose = () => setAlert(undefined);
  const handleDelete = async () => {
    if (mappingId) {
      try {
        await deleteMapping({ id: mappingId }).unwrap();
        props.onClose && props.onClose({}, "escapeKeyDown");
        history.replace(`/sources/${sourceId}`);
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
      <DialogTitle>{t("deleteMappingPrompt")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("cannotUndoAction")}</DialogContentText>
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
          className={clsx(classes.button, classes.error)}
          variant="contained"
          onClick={handleDelete}
          disabled={isDeleteLoading}
        >
          {isDeleteLoading ? (
            <CircularProgress />
          ) : (
            <Typography color="textPrimary">{t("confirmDelete")}</Typography>
          )}
        </Button>
      </DialogActions>
      <Alert
        severity="error"
        open={!!alert}
        onClose={handleAlertClose}
        message={alert}
      />
    </Dialog>
  );
};

export default MappingDeleteDialog;
