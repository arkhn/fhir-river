import React, { useState } from "react";

import Form from "@arkhn/ui/lib/Form/Form";
import type { FormInputProperty } from "@arkhn/ui/lib/Form/InputTypes";
import { CircularProgress, makeStyles, Typography } from "@material-ui/core";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { TFunction } from "i18next";
import { isEqual } from "lodash";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import Button from "common/components/Button";
import {
  useApiProjectsCreateMutation,
  useApiProjectsUpdateMutation,
} from "services/api/endpoints";
import {
  ApiValidationError,
  apiValidationErrorFromResponse,
} from "services/api/errors";
import type { ProjectRequest } from "services/api/generated/api.generated";

import { projectEdited, selectProjectCurrent } from "./projectSlice";

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
    width: "auto",
    minWidth: 150,
  },
}));

const projectInputs: (t: TFunction) => FormInputProperty<ProjectRequest>[] = (
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

const ProjectForm = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const classes = useStyles();

  const [errors, setErrors] = useState<
    ApiValidationError<ProjectRequest> | undefined
  >(undefined);

  const project = useAppSelector(selectProjectCurrent);

  const [
    apiProjectsCreate,
    { isLoading: isCreateProjectLoading },
  ] = useApiProjectsCreateMutation();
  const [
    apiProjectsUpdate,
    { isLoading: isUpdateSourceLoading },
  ] = useApiProjectsUpdateMutation();

  const isLoading = isCreateProjectLoading || isUpdateSourceLoading;

  const handleProjectSubmit = async (projectRequest: ProjectRequest) => {
    if (project && isEqual(project, { ...project, ...projectRequest })) {
      dispatch(projectEdited(project));
      return;
    }

    try {
      const submittedSource = project
        ? await apiProjectsUpdate({ id: project.id, projectRequest }).unwrap()
        : await apiProjectsCreate({ projectRequest }).unwrap();
      dispatch(projectEdited(submittedSource));
    } catch (e) {
      const data = apiValidationErrorFromResponse<ProjectRequest>(
        e as FetchBaseQueryError
      );
      setErrors(data);
    }
  };

  return (
    <div className={classes.formContainer}>
      <Form<ProjectRequest>
        properties={projectInputs(t)}
        submit={handleProjectSubmit}
        formStyle={{ display: "block" }}
        defaultValues={project}
        displaySubmitButton={false}
        validationErrors={errors}
        formHeader={
          <Typography className={classes.title} variant="h5">
            {project ? t("editProject") : t("newProject")}
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
            ) : project ? (
              t("updateProject")
            ) : (
              t("createProject")
            )}
          </Button>
        }
      />
    </div>
  );
};

export default ProjectForm;
