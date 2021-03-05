import React from "react";

import Form from "@arkhn/ui/lib/Form/Form";
import { FormInputProperty } from "@arkhn/ui/lib/Form/InputTypes";
import {
  Button,
  CircularProgress,
  Drawer,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import {
  useCreateSourceMutation,
  useUpdateSourceMutation,
} from "services/api/api";
import { Source, Credential } from "services/api/generated/api.generated";

import { editSource, selectSourceToEdit } from "./sourceSlice";

const credentialInputs: (t: TFunction) => FormInputProperty<Credential>[] = (
  t
) => [
  {
    type: "text",
    name: "host",
    label: t("host"),
    variant: "outlined",
    validationRules: { required: true },
  },
  {
    type: "number",
    name: "port",
    label: t("port"),
    variant: "outlined",
    validationRules: { required: true },
  },
  {
    type: "text",
    name: "database",
    label: t("database"),
    variant: "outlined",
    validationRules: { required: true },
  },
  {
    type: "text",
    name: "login",
    label: t("username"),
    variant: "outlined",
    validationRules: { required: true },
  },
  {
    type: "text",
    password: true,
    name: "password",
    label: t("password"),
    variant: "outlined",
    validationRules: { required: true },
  },
  {
    type: "select",
    selectOptions: [
      {
        id: "MSSQL",
        label: "MSSQL",
      },
      {
        id: "POSTGRES",
        label: "POSTGRESQL",
      },
      {
        id: "ORACLE",
        label: "ORACLE",
      },
      {
        id: "SQLLITE",
        label: "SQLITE",
      },
    ],
    name: "model",
    label: t("vendor"),
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

  const handleChangeSource = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      editSource({
        ...source,
        name: e.target.value,
      } as Source)
    );
  };

  const handleSubmitSource = (data: Credential) => {
    const _source: Source = {
      name: source?.name ?? "",
      credential: {
        host: data.host,
        port: data.port,
        database: data.database,
        login: data.login,
        password: data.password,
        model: data.model,
      },
    };
    if (source?.id) {
      updateSource({ id: source.id, source: _source })
        .unwrap()
        .then(() => handleCloseDrawer())
        // TODO: display error in snackbar notification (?)
        .catch();
    } else if (source) {
      createSource({ source: _source })
        .unwrap()
        .then(() => handleCloseDrawer())
        // TODO: display error in snackbar notification (?)
        .catch();
    }
  };

  return (
    <Drawer open={isDrawerOpen} onClose={handleCloseDrawer} anchor="right">
      <div className={classes.formContainer}>
        <TextField
          id="outlined-basic"
          label="Outlined"
          variant="outlined"
          onChange={handleChangeSource}
          value={source?.name ?? ""}
        />
        <Form<Credential>
          properties={credentialInputs(t)}
          submit={handleSubmitSource}
          formStyle={{ display: "block" }}
          defaultValues={{ ...source, ...source?.credential }}
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
