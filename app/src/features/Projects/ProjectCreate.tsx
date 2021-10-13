import React from "react";

import { ButtonProps } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import Button from "common/components/Button";

import { createProject } from "./projectSlice";

type ProjectCreateProps = ButtonProps;

const ProjectCreate = ({ ...buttonProps }: ProjectCreateProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleCreateSource = () => dispatch(createProject());

  return (
    <Button
      {...buttonProps}
      color="primary"
      variant="contained"
      onClick={handleCreateSource}
    >
      {t("newProject")}
    </Button>
  );
};

export default ProjectCreate;
