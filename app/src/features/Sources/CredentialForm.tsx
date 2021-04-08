import React from "react";

import Form from "@arkhn/ui/lib/Form/Form";
import { FormInputProperty } from "@arkhn/ui/lib/Form/InputTypes";
import {
  Button,
  CircularProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { TFunction } from "i18next";
import { head } from "lodash";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import {
  useApiCredentialsCreateMutation,
  useApiCredentialsListQuery,
  useApiCredentialsUpdateMutation,
} from "services/api/endpoints";
import type { Credential, Source } from "services/api/generated/api.generated";

import { credentialEdited } from "./sourceSlice";

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

type CredentialFormInputs = Omit<Credential, "source">;

const credentialInputs: (
  t: TFunction
) => FormInputProperty<CredentialFormInputs>[] = (t) => [
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
    defaultValue: "POSTGRES",
    validationRules: { required: true },
  },
];

type CredentialFormProps = {
  source: Source;
};

const CredentialForm = ({ source }: CredentialFormProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    isLoading: isCredentialsLoading,
    data: credentials,
  } = useApiCredentialsListQuery({
    source: source.id,
  });
  const credential = head(credentials);

  const [
    createCredential,
    { isLoading: isCreateCredentialLoading },
  ] = useApiCredentialsCreateMutation();
  const [
    updateCredential,
    { isLoading: isUpdateCredentialLoading },
  ] = useApiCredentialsUpdateMutation();

  const isLoading = isCreateCredentialLoading || isUpdateCredentialLoading;

  const handleCredentialSubmit = async (
    credentialInputs: CredentialFormInputs
  ) => {
    try {
      const submittedCredential = credential
        ? await updateCredential({
            id: credential.id,
            credentialRequest: {
              source: credential.source,
              ...credentialInputs,
            },
          }).unwrap()
        : await createCredential({
            credentialRequest: { source: source.id, ...credentialInputs },
          }).unwrap();
      dispatch(credentialEdited(submittedCredential));
    } catch {}
  };

  if (isCredentialsLoading) return <CircularProgress />;
  return (
    <div className={classes.formContainer}>
      <Form<CredentialFormInputs>
        properties={credentialInputs(t)}
        submit={handleCredentialSubmit}
        formStyle={{ display: "block" }}
        defaultValues={credential}
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
                {credential ? t("updateCredential") : t("createCredential")}
              </Typography>
            )}
          </Button>
        }
      />
    </div>
  );
};

export default CredentialForm;
