import React, { useState } from "react";

import {
  Button,
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  makeStyles,
  Typography,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import Alert from "common/components/Alert";

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

type SliceNameDialogProps = Omit<DialogProps, "onSubmit" | "onClose"> & {
  onSubmit: (name: string) => void;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const SliceNameDialog = ({
  onSubmit,
  ...props
}: SliceNameDialogProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const handleAlertClose = () => setAlert(undefined);
  const handleNameChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setName(event.target.value);
  };
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    setName("");
    props.onClose && props.onClose(e);
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onSubmit(name);
    handleClose(e);
  };

  return (
    <Dialog
      maxWidth="sm"
      PaperProps={{ className: classes.root }}
      {...props}
      fullWidth
    >
      <>
        <DialogTitle>{t("sliceName")}</DialogTitle>
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
          >
            <Typography>{t("confirm")}</Typography>
          </Button>
        </DialogActions>
        <Alert
          severity="error"
          open={!!alert}
          onClose={handleAlertClose}
          message={alert}
        />
      </>
    </Dialog>
  );
};

export default SliceNameDialog;
