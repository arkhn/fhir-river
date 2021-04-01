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

import { useAppDispatch, useAppSelector } from "app/store";
import {
  useApiSourcesCreateMutation,
  useUpdateSourceMutation,
} from "services/api/api";
import { Source } from "services/api/generated/api.generated";

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

const sourceInputs: (t: TFunction) => FormInputProperty<Source>[] = (t) => [
  {
    type: "text",
    name: "name",
    label: t("name"),
    variant: "outlined",
    validationRules: { required: true },
  },
];

const SourceForm = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const source = useAppSelector(selectSourceToEdit);

  const [
    createSource,
    { isLoading: isCreateSourceLoading },
  ] = useCreateSourceMutation();
  const [
    updateSource,
    { isLoading: isUpdateSourceLoading },
  ] = useUpdateSourceMutation();

  const isLoading = isCreateSourceLoading || isUpdateSourceLoading;

  const handleSubmitSource = (source: Source) => {
    if (source.id) {
      updateSource({ id: source.id, source })
        .unwrap()
        .then((source) => dispatch(editSource(source)))
        .catch();
    } else {
      createSource({ source })
        .unwrap()
        .then((source) => dispatch(editSource(source)))
        .catch();
    }
  };

  return (
    <div className={classes.formContainer}>
      <Form<Source>
        properties={sourceInputs(t)}
        submit={handleSubmitSource}
        formStyle={{ display: "block" }}
        defaultValues={source ?? undefined}
        displaySubmitButton={false}
        formHeader={
          <Typography className={classes.title} variant="h5">
            {source?.id ? t("editSource") : t("newSource")}
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
                {source?.id ? t("editSource") : t("createSource")}
              </Typography>
            )}
          </Button>
        }
      />
    </div>
  );
};

export default SourceForm;
