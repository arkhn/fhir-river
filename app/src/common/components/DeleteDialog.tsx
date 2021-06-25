import React from "react";

import {
  Button,
  Dialog,
  DialogProps as MuiDialogProps,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  makeStyles,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import Alert from "common/components/Alert";

type DeleteDialogProps = MuiDialogProps & {
  title: string;
  loading: boolean;
  onDelete: React.MouseEventHandler<HTMLButtonElement> | undefined;
  alert?: string;
  onAlertClose: (
    event?: React.SyntheticEvent<Element, Event> | undefined,
    reason?: string | undefined
  ) => void;
};

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

const DeleteDialog = ({
  title,
  onDelete,
  loading,
  alert,
  onAlertClose,
  ...props
}: DeleteDialogProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();

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
      <DialogTitle>{title}</DialogTitle>
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
          onClick={onDelete}
        >
          {loading ? (
            <CircularProgress />
          ) : (
            <Typography color="textPrimary">{t("confirmDelete")}</Typography>
          )}
        </Button>
      </DialogActions>
      <Alert
        severity="error"
        open={!!alert}
        onClose={onAlertClose}
        message={alert}
      />
    </Dialog>
  );
};

export default DeleteDialog;
