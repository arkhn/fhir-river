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

import { useAppDispatch } from "app/store";
import {
  useApiSourcesCreateMutation,
  useApiSourcesUpdateMutation,
} from "services/api/api";
import { Source, SourceRequest } from "services/api/generated/api.generated";

import { updateSource } from "./sourceSlice";

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

const sourceInputs: (t: TFunction) => FormInputProperty<SourceRequest>[] = (
  t
) => [
  {
    type: "text",
    name: "name",
    label: t("name"),
    variant: "outlined",
    validationRules: { required: true },
  },
];

type SourceFormProps = {
  sourceToUpdate?: Source;
};

const SourceForm = ({ sourceToUpdate }: SourceFormProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const [
    apiCreateSource,
    { isLoading: isCreateSourceLoading },
  ] = useApiSourcesCreateMutation();
  const [
    apiUpdateSource,
    { isLoading: isUpdateSourceLoading },
  ] = useApiSourcesUpdateMutation();

  const isLoading = isCreateSourceLoading || isUpdateSourceLoading;

  const handleSubmitSource = (sourceRequest: SourceRequest) => {
    if (sourceToUpdate) {
      apiUpdateSource({ id: sourceToUpdate.id, sourceRequest })
        .unwrap()
        .then((source) => dispatch(updateSource(source)))
        .catch();
    } else {
      apiCreateSource({ sourceRequest })
        .unwrap()
        .then((source) => dispatch(updateSource(source)))
        .catch();
    }
  };

  return (
    <div className={classes.formContainer}>
      <Form<SourceRequest>
        properties={sourceInputs(t)}
        submit={handleSubmitSource}
        formStyle={{ display: "block" }}
        defaultValues={sourceToUpdate}
        displaySubmitButton={false}
        formHeader={
          <Typography className={classes.title} variant="h5">
            {sourceToUpdate ? t("editSource") : t("newSource")}
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
                {sourceToUpdate ? t("editSource") : t("createSource")}
              </Typography>
            )}
          </Button>
        }
      />
    </div>
  );
};

export default SourceForm;
