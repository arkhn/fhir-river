import React from "react";

import { FormInputProperty } from "@arkhn/ui";
import Form from "@arkhn/ui/lib/Form/Form";
import {
  makeStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
} from "@material-ui/core";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import { MappingRequest } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  fileInput: {
    display: "none",
  },
  button: {
    marginLeft: theme.spacing(3),
    width: "auto",
    "& svg": {
      fill: theme.palette.text.primary,
    },
  },
}));

type CredentialDialogInputs = Omit<MappingRequest["credential"], "owners">;

const credentialInputs: (
  t: TFunction
) => FormInputProperty<CredentialDialogInputs>[] = (t) => [
  {
    type: "text",
    name: "host",
    label: t("host"),
    variant: "outlined",
    validationRules: { required: true },
    disabled: true,
    containerStyle: {
      margin: "16px 10px",
    },
  },
  {
    type: "number",
    name: "port",
    label: t("port"),
    variant: "outlined",
    validationRules: {
      required: true,
      min: 0,
      max: 65535,
    },
    disabled: true,
    containerStyle: {
      margin: "16px 10px",
    },
  },
  {
    type: "text",
    name: "database",
    label: t("database"),
    variant: "outlined",
    validationRules: { required: true },
    disabled: true,
    containerStyle: {
      margin: "16px 10px",
    },
  },
  {
    type: "text",
    name: "login",
    label: t("username"),
    variant: "outlined",
    validationRules: { required: true },
    containerStyle: {
      margin: "16px 10px",
    },
  },
  {
    type: "text",
    password: true,
    name: "password",
    label: t("password"),
    variant: "outlined",
    validationRules: { required: true },
    containerStyle: {
      margin: "16px 10px",
    },
  },
  {
    type: "select",
    containerStyle: {
      margin: "16px 10px",
    },
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
    disabled: true,
  },
];

type CredentialDialogProps = {
  credential?: CredentialDialogInputs;
  onSubmit: (credentialInputs: CredentialDialogInputs) => void;
} & Omit<DialogProps, "onSubmit">;

const CredentialDialog = ({
  credential,
  onSubmit,
  ...dialogProps
}: CredentialDialogProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Dialog {...dialogProps}>
      <DialogTitle>{t("editCredential")}</DialogTitle>
      <DialogContent>
        <Form<CredentialDialogInputs>
          properties={credentialInputs(t)}
          formId="credential-dialog-form"
          submit={onSubmit}
          formStyle={{ display: "block" }}
          defaultValues={credential}
          displaySubmitButton={false}
        />
      </DialogContent>
      <DialogActions>
        <Button
          className={classes.button}
          variant="outlined"
          fullWidth={false}
          onClick={dialogProps.onClose}
        >
          {t("cancel")}
        </Button>
        <Button
          className={classes.button}
          form="credential-dialog-form"
          type="submit"
          variant="contained"
          color="primary"
          fullWidth={false}
        >
          {t("updateCredential")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CredentialDialog;
