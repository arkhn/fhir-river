import React from "react";
import { useTranslation } from "react-i18next";

import Form from "@arkhn/ui/lib/Form/Form";
import {
  Button,
  CircularProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";

import { Source } from "services/api/generated/api.generated";
import { FormInputProperty } from "@arkhn/ui/lib/Form/InputTypes";
import { TFunction } from "i18next";
import {
  useCreateSourceMutation,
  useUpdateSourceMutation,
} from "services/api/api";

type SourceFormData = {
  name: string;
};

type SourceFormProps = {
  source?: Source;
  submitSuccess?: (source: Source) => void;
};

const inputs: (t: TFunction) => FormInputProperty<SourceFormData>[] = (t) => [
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

const SourceForm = ({ source, submitSuccess }: SourceFormProps) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [
    createSource,
    { isLoading: isCreateSourceLoading },
  ] = useCreateSourceMutation();
  const [
    updateSource,
    { isLoading: isUpdateSourceLoading },
  ] = useUpdateSourceMutation();

  const isLoading = isCreateSourceLoading || isUpdateSourceLoading;

  const handleSubmit = (data: SourceFormData) => {
    if (source && source.id) {
      updateSource({ id: source.id, source: data })
        .unwrap()
        .then(() => {
          submitSuccess && submitSuccess(data);
        })
        // Display error in snackbar notification (?)
        .catch();
    } else {
      createSource({ source: data })
        .unwrap()
        .then(() => {
          submitSuccess && submitSuccess(data);
        })
        // Display error in snackbar notification (?)
        .catch();
    }
  };

  return (
    <div className={classes.formContainer}>
      <Form<SourceFormData>
        properties={inputs(t)}
        submit={handleSubmit}
        formStyle={{ display: "block" }}
        defaultValues={{ name: source?.name ?? "" }}
        formHeader={
          <Typography className={classes.title} variant="h5">
            {source ? t("renameSource") : t("newSource")}
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
                {source ? t("renameSource") : t("createSource")}
              </Typography>
            )}
          </Button>
        }
      />
    </div>
  );
};

export default SourceForm;
