import React from "react";

import {
  Button,
  CircularProgress,
  Drawer,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import {
  useCreateSourceMutation,
  useUpdateSourceMutation,
} from "services/api/api";

import { selectSourceToEdit, editSource } from "./sourceSlice";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "baseline",
    minWidth: 400,
  },
  formField: {
    margin: theme.spacing(1),
  },
  title: {
    margin: theme.spacing(1),
    fontWeight: "bold",
  },
  button: {
    margin: theme.spacing(1),
    textTransform: "none",
    width: "auto",
    minWidth: 150,
  },
}));

const SourceForm = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const source = useAppSelector(selectSourceToEdit);
  const isDrawerOpen = !!source;
  const handleCloseDrawer = () => dispatch(editSource(null));

  const [
    createSource,
    { isLoading: isCreateSourceLoading },
  ] = useCreateSourceMutation();
  const [
    updateSource,
    { isLoading: isUpdateSourceLoading },
  ] = useUpdateSourceMutation();

  const isLoading = isCreateSourceLoading || isUpdateSourceLoading;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (source?.id) {
      updateSource({ id: source.id, source })
        .unwrap()
        .then(() => handleCloseDrawer())
        // TODO: display error in snackbar notification (?)
        .catch();
    } else if (source) {
      createSource({ source })
        .unwrap()
        .then(() => handleCloseDrawer())
        // TODO: display error in snackbar notification (?)
        .catch();
    }
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      editSource({
        ...source,
        name: e.target.value,
      })
    );
  };

  return (
    <Drawer open={isDrawerOpen} onClose={handleCloseDrawer} anchor="right">
      <form
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={classes.formContainer}
      >
        <Typography className={classes.title} variant="h5">
          {source?.id ? t("renameSource") : t("newSource")}
        </Typography>
        <TextField
          id="standard-basic"
          label="Name"
          onChange={handleChangeName}
          value={source?.name ?? ""}
          variant="outlined"
          className={classes.formField}
        />
        <Button
          className={classes.button}
          type="submit"
          variant="contained"
          color="primary"
          fullWidth={false}
        >
          {isLoading ? (
            <CircularProgress color="inherit" size={23} />
          ) : (
            <Typography>
              {source?.id ? t("renameSource") : t("createSource")}
            </Typography>
          )}
        </Button>
      </form>
    </Drawer>
  );
};

export default SourceForm;
