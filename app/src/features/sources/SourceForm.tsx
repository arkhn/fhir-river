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

import SourceOwnersSelect from "./SourceOwnersSelect";
import { editSource, selectSourceToEdit } from "./sourceSlice";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    minWidth: 400,
  },
  sourceName: {
    minWidth: 400,
    padding: "1em",
    display: "flex",
    flexDirection: "column",
  },
  sourceNameInput: {
    margin: theme.spacing(2),
  },
  title: {
    marginTop: theme.spacing(3),
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

  const handleSourceRename = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      editSource({
        ...source,
        name: e.target.value,
      } as Source)
    );
  };

  const handleSubmitSource = (data: Credential) => {
    if (!source) return;

    const editedSource: Source = {
      ...source,
      credential: {
        ...source.credential,
        ...data,
      },
    };
    if (editedSource.id) {
      updateSource({ id: editedSource.id, source: editedSource })
        .unwrap()
        .then((source) => dispatch(editSource(source)))
        .catch();
    } else {
      createSource({ source: editedSource })
        .unwrap()
        .then((source) => dispatch(editSource(source)))
        .catch();
    }
  };

  return (
    <Drawer open={isDrawerOpen} onClose={handleCloseDrawer} anchor="right">
      <Typography className={classes.title} variant="h5">
        {source?.id ? t("editSource") : t("newSource")}
      </Typography>
      <div className={classes.formContainer}>
        <div className={classes.sourceName}>
          <TextField
            id="outlined-basic"
            label="Name"
            variant="outlined"
            required={true}
            onChange={handleSourceRename}
            value={source?.name ?? ""}
            className={classes.sourceNameInput}
          />
        </div>
        <Form<Credential>
          properties={credentialInputs(t)}
          submit={handleSubmitSource}
          formStyle={{ display: "block" }}
          defaultValues={{ ...source?.credential }}
          displaySubmitButton={false}
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
                  {source?.id ? t("editSource") : t("createSource")}
                </Typography>
              )}
            </Button>
          }
        />
      </div>
      {source?.id && <SourceOwnersSelect sourceId={source.id} />}
    </Drawer>
  );
};

export default SourceForm;
