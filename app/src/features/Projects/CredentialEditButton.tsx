import React from "react";

import { ButtonProps } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useAppDispatch } from "app/store";
import Button from "common/components/Button";
import { useApiProjectsRetrieveQuery } from "services/api/endpoints";

import { editCredential } from "./projectSlice";

type CredentialEditButtonProps = ButtonProps;

const CredentialEditButton = ({
  ...buttonProps
}: CredentialEditButtonProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { projectId: id } = useParams<{ projectId: string }>();

  const { data: project } = useApiProjectsRetrieveQuery({ id }, { skip: !id });
  const handleSourceEdit = () => {
    if (project) dispatch(editCredential(project));
  };

  return (
    <Button {...buttonProps} onClick={handleSourceEdit}>
      {t("databaseSettings")}
    </Button>
  );
};

export default CredentialEditButton;
