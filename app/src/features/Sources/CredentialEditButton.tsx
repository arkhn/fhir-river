import React from "react";

import { ButtonProps } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useAppDispatch } from "app/store";
import Button from "common/components/Button";
import { useApiSourcesRetrieveQuery } from "services/api/endpoints";

import { editCredential } from "./sourceSlice";

type SourceEditButtonProps = ButtonProps;

const CredentialEditButton = ({
  ...buttonProps
}: SourceEditButtonProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { sourceId: id } = useParams<{ sourceId: string }>();

  const { data: source } = useApiSourcesRetrieveQuery({ id }, { skip: !id });
  const handleSourceEdit = () => {
    if (source) dispatch(editCredential(source));
  };

  return (
    <Button {...buttonProps} onClick={handleSourceEdit}>
      {t("databaseSettings")}
    </Button>
  );
};

export default CredentialEditButton;
