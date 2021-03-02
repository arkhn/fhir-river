import React from "react";

import Form from "@arkhn/ui/lib/Form/Form";
import { FormInputProperty } from "@arkhn/ui/lib/Form/InputTypes";
import {
  Button,
  CircularProgress,
  Drawer,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import {
  useCreateSourceMutation,
  useUpdateSourceMutation,
} from "services/api/api";
import { Source } from "services/api/generated/api.generated";

import { editSource, selectSourceToEdit } from "./sourceSlice";

const inputs: (t: TFunction) => FormInputProperty<Source>[] = (t) => [
  {
    type: "text",
    name: "name",
    label: t("sourceName"),
    variant: "outlined",
    validationRules: { required: true },
  },
];

const useStyles = makeStyles((theme) => ({
  formContainer: {
    marginBlock: theme.spacing(3),
    minWidth: 400,
  },
  title: {
    marginLeft: theme.spacing(3),
    fontWeight: "bold",
  },
  button: {
    marginLeft: theme.spacing(3),
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

  const handleSubmit = (data: Source) => {
    if (source?.id) {
      updateSource({ id: source.id, source: { ...source, ...data } })
        .unwrap()
        .then(() => handleCloseDrawer())
        // TODO: display error in snackbar notification (?)
        .catch();
    } else if (source) {
      createSource({ source: data })
        .unwrap()
        .then(() => handleCloseDrawer())
        // TODO: display error in snackbar notification (?)
        .catch();
    }
  };

  return (
    <Drawer open={isDrawerOpen} onClose={handleCloseDrawer} anchor="right">
      <div className={classes.formContainer}>
        <Form<Source>
          properties={inputs(t)}
          submit={handleSubmit}
          formStyle={{ display: "block" }}
          defaultValues={{ name: source?.name ?? "" }}
          displaySubmitButton={false}
          formHeader={
            <Typography className={classes.title} variant="h5">
              {source?.id ? t("renameSource") : t("newSource")}
            </Typography>
          }
          formFooter={
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
          }
        />
      </div>
    </Drawer>
  );
};

export default SourceForm;
