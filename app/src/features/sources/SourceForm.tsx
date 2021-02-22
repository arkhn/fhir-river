import React from "react";
import { useTranslation } from "react-i18next";

import Form from "@arkhn/ui/lib/Form/Form";
import {
  Box,
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
  submit?: (source: Source) => void;
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

const SourceForm = ({ source, submit }: SourceFormProps) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [createSource, createSourceData] = useCreateSourceMutation();
  const [updateSource, updateSourceData] = useUpdateSourceMutation();

  const isLoading = createSourceData.isLoading || updateSourceData.isLoading;

  const _submit = (data: SourceFormData) => {
    if (source && source.id) {
      updateSource({ id: source.id, source: data })
        .unwrap()
        .then(() => {
          submit && submit(data);
        })
        // Display error in snackbar notification (?)
        .catch();
    } else {
      createSource({ source: data })
        .unwrap()
        .then(() => {
          submit && submit(data);
        })
        // Display error in snackbar notification (?)
        .catch();
    }
  };

  return (
    <Box className={classes.formContainer}>
      <Form<SourceFormData>
        properties={inputs(t)}
        submit={_submit}
        formStyle={{ display: "block" }}
        defaultValues={{ name: source?.name ?? "" }}
        formHeader={
          <Typography className={classes.title} variant="h5">
            {source ? t("editSource") : t("newSource")}
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
                {source ? t("editSource") : t("createSource")}
              </Typography>
            )}
          </Button>
        }
      />
    </Box>
  );
};

export default SourceForm;
