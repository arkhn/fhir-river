import React, { useState } from "react";

import Form from "@arkhn/ui/lib/Form/Form";
import type { FormInputProperty } from "@arkhn/ui/lib/Form/InputTypes";
import {
  CircularProgress,
  makeStyles,
  Typography,
  Divider,
} from "@material-ui/core";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { TFunction } from "i18next";
import { isEqual } from "lodash";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import Button from "common/components/Button";
import {
  useApiSourcesCreateMutation,
  useApiSourcesUpdateMutation,
} from "services/api/endpoints";
import {
  ApiValidationError,
  apiValidationErrorFromResponse,
} from "services/api/errors";
import type { SourceRequest } from "services/api/generated/api.generated";

import { sourceEdited, selectSourceCurrent } from "./sourceSlice";
import UploadSourceButton from "./UploadSourceButton";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    minWidth: 400,
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
  divider: {
    margin: theme.spacing(4, 3),
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
    containerStyle: {
      margin: "16px 10px",
    },
  },
];

const SourceForm = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const classes = useStyles();

  const [errors, setErrors] = useState<
    ApiValidationError<SourceRequest> | undefined
  >(undefined);

  const source = useAppSelector(selectSourceCurrent);

  const [
    apiSourcesCreate,
    { isLoading: isCreateSourceLoading },
  ] = useApiSourcesCreateMutation();
  const [
    apiSourcesUpdate,
    { isLoading: isUpdateSourceLoading },
  ] = useApiSourcesUpdateMutation();

  const isLoading = isCreateSourceLoading || isUpdateSourceLoading;

  const handleSourceSubmit = async (sourceRequest: SourceRequest) => {
    if (source && isEqual(source, { ...source, ...sourceRequest })) {
      dispatch(sourceEdited(source));
      return;
    }

    try {
      const submittedSource = source
        ? await apiSourcesUpdate({ id: source.id, sourceRequest }).unwrap()
        : await apiSourcesCreate({ sourceRequest }).unwrap();
      dispatch(sourceEdited(submittedSource));
    } catch (e) {
      const data = apiValidationErrorFromResponse<SourceRequest>(
        e as FetchBaseQueryError
      );
      setErrors(data);
    }
  };

  return (
    <div className={classes.formContainer}>
      <Form<SourceRequest>
        properties={sourceInputs(t)}
        submit={handleSourceSubmit}
        formStyle={{ display: "block" }}
        defaultValues={source}
        displaySubmitButton={false}
        validationErrors={errors}
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
            ) : source ? (
              t("updateSource")
            ) : (
              t("createSource")
            )}
          </Button>
        }
      />
      <Divider className={classes.divider} variant="middle" />
      <UploadSourceButton />
    </div>
  );
};

export default SourceForm;
