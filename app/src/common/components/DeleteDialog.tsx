import React from "react";

import {
  Dialog,
  DialogProps as MuiDialogProps,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  makeStyles,
  CircularProgress,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import Button from "./Button";

type DeleteDialogProps = MuiDialogProps & {
  title: string;
  isLoading?: boolean;
  onDelete?: React.MouseEventHandler;
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(2),
  },
  error: {
    backgroundColor: theme.palette.error.main,
    "& .MuiTypography-body1": {
      color: theme.palette.primary.contrastText,
    },
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

const DeleteDialog = ({
  title,
  onDelete,
  isLoading,
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
          className={classes.button}
          disableRipple
          onClick={handleClose}
          color="inherit"
        >
          {t("cancel")}
        </Button>
        <Button
          className={clsx(classes.button, classes.error)}
          variant="contained"
          onClick={onDelete}
        >
          {isLoading ? <CircularProgress /> : t("confirmDelete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
