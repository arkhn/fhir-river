import React, { useEffect } from "react";

import {
  Button,
  CircularProgress,
  makeStyles,
  Typography,
  TextField,
  MenuItem,
} from "@material-ui/core";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  useApiCredentialsCreateMutation,
  useApiCredentialsUpdateMutation,
} from "services/api/endpoints";
import type {
  Credential,
  Source,
  ModelEnum,
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

type CredentialFormInputs = {
  host: string;
  port: number;
  database: string;
  login: string;
  password: string;
  model: ModelEnum;
};

type CredentialFormProps = {
  source: Source;
  credential?: Credential;
};

const CredentialForm = ({
  source,
  credential,
}: CredentialFormProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { register, reset, handleSubmit } = useForm<CredentialFormInputs>({
    defaultValues: credential ? { ...credential } : {},
  });

  useEffect(() => {
    reset(credential ? { ...credential } : {});
  }, [credential]);

  const [
    createCredential,
    { isLoading: isCreateCredentialLoading },
  ] = useApiCredentialsCreateMutation();
  const [
    updateCredential,
    { isLoading: isUpdateCredentialLoading },
  ] = useApiCredentialsUpdateMutation();

  const isLoading = isCreateCredentialLoading || isUpdateCredentialLoading;

  const handleCredentialSubmit = (credentialInputs: CredentialFormInputs) => {
    if (credential) {
      updateCredential({
        id: credential.id,
        credentialRequest: { source: credential.source, ...credentialInputs },
      });
    } else {
      createCredential({
        credentialRequest: { source: source.id, ...credentialInputs },
      });
    }
  };

  return (
    <div className={classes.formContainer}>
      <form onSubmit={handleSubmit(handleCredentialSubmit)}>
        <TextField required label={t("host")} inputRef={register("host").ref} />
        <TextField required label={t("port")} inputRef={register("port").ref} />
        <TextField
          required
          label={t("database")}
          inputRef={register("database").ref}
        />
        <TextField
          required
          label={t("username")}
          inputRef={register("login").ref}
        />
        <TextField
          required
          label={t("password")}
          inputRef={register("password").ref}
        />
        <TextField
          required
          select
          label={t("vendor")}
          inputRef={register("model").ref}
        >
          <MenuItem key={"MSSQL"} value={"MSSQL"}>
            MSSQL
          </MenuItem>
          <MenuItem key={"POSTGRES"} value={"POSGRES"}>
            POSTGRESQL
          </MenuItem>
          <MenuItem key={"ORACLE"} value={"ORACLE"}>
            ORACLE
          </MenuItem>
          <MenuItem key={"SQLLITE"} value={"SQLLITE"}>
            SQLITE
          </MenuItem>
        </TextField>
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
      </form>
    </div>
  );
};

export default CredentialForm;
