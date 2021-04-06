import React, { useEffect } from "react";

import {
  Button,
  CircularProgress,
  makeStyles,
  Typography,
  TextField,
  MenuItem,
} from "@material-ui/core";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  useApiCredentialsCreateMutation,
  useApiCredentialsUpdateMutation,
} from "services/api/endpoints";
import type {
  CredentialRequest,
  Credential,
  Source,
  ModelEnum,
} from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    minWidth: 400,
    padding: "1em",
    display: "flex",
    flexDirection: "column",
  },
  input: {
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
  model: ModelEnum | "";
};

type CredentialFormValidatedInputs = Omit<CredentialRequest, "source">;

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

  const defaultValues = credential
    ? { ...credential }
    : {
        host: "",
        database: "",
        number: 0,
        login: "",
        password: "",
      };

  const { control, reset, handleSubmit } = useForm<CredentialFormInputs>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
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

  const handleCredentialSubmit = (
    credentialInputs: CredentialFormValidatedInputs
  ) => {
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
    <form
      className={classes.formContainer}
      onSubmit={handleSubmit(handleCredentialSubmit)}
    >
      <Controller
        name="host"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <TextField
            required
            label={t("host")}
            inputRef={ref}
            onBlur={onBlur}
            variant="outlined"
            className={classes.input}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <Controller
        name="port"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <TextField
            required
            type="number"
            label={t("port")}
            inputRef={ref}
            onBlur={onBlur}
            variant="outlined"
            className={classes.input}
            onChange={onChange}
            value={value || ""}
          />
        )}
      />
      <Controller
        name="database"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <TextField
            required
            label={t("database")}
            inputRef={ref}
            onBlur={onBlur}
            variant="outlined"
            className={classes.input}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <Controller
        name="login"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <TextField
            required
            label={t("login")}
            inputRef={ref}
            onBlur={onBlur}
            variant="outlined"
            className={classes.input}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <TextField
            required
            type="password"
            label={t("password")}
            inputRef={ref}
            onBlur={onBlur}
            variant="outlined"
            className={classes.input}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <Controller
        name="model"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <TextField
            required
            select
            label={t("vendor")}
            inputRef={ref}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            variant="outlined"
            className={classes.input}
          >
            <MenuItem key={"MSSQL"} value={"MSSQL"}>
              MSSQL
            </MenuItem>
            <MenuItem key={"POSTGRES"} value={"POSTGRES"}>
              POSTGRESQL
            </MenuItem>
            <MenuItem key={"ORACLE"} value={"ORACLE"}>
              ORACLE
            </MenuItem>
            <MenuItem key={"SQLLITE"} value={"SQLLITE"}>
              SQLITE
            </MenuItem>
          </TextField>
        )}
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
            {credential ? t("updateCredential") : t("createCredential")}
          </Typography>
        )}
      </Button>
    </form>
  );
};

export default CredentialForm;
