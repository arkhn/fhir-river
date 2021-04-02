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
import { useTranslation } from "react-i18next";

import CredentialOwnersSelect from "features/credentials/CredentialOwnersSelect";
import {
  useApiCredentialsCreateMutation,
  useApiCredentialsUpdateMutation,
  useApiCredentialsListQuery,
} from "services/api/api";
import type {
  Credential,
  CredentialRequest,
  Source,
} from "services/api/generated/api.generated";

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

type SourceCredentialFormProps = {
  source: Source;
};

const SourceCredentialForm = ({
  source,
}: SourceCredentialFormProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    isLoading: isListCredentialLoading,
    data: credentials,
  } = useApiCredentialsListQuery({
    source: source.id,
  });
  const credential = credentials && credentials[0];

  const [
    createCredential,
    { isLoading: isCreateCredentialLoading },
  ] = useApiCredentialsCreateMutation();
  const [
    updateCredential,
    { isLoading: isUpdateCredentialLoading },
  ] = useApiCredentialsUpdateMutation();

  const isLoading =
    isListCredentialLoading ||
    isCreateCredentialLoading ||
    isUpdateCredentialLoading;

  const handleSubmitCredential = (credentialRequest: CredentialRequest) => {
    if (credential) {
      updateCredential({ id: credential.id, credentialRequest });
    } else {
      createCredential({ credentialRequest });
    }
  };

  return (
    <div className={classes.formContainer}>
      <Form<Credential>
        properties={credentialInputs(t)}
        submit={handleSubmitCredential}
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
              <Typography>{t("submitCredential")}</Typography>
            )}
          </Button>
        }
      />
      {credential?.id && (
        <CredentialOwnersSelect credentialId={credential.id} />
      )}
    </div>
  );
};

export default SourceCredentialForm;
