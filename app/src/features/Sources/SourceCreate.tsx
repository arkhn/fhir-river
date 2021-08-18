import React from "react";

import { ButtonProps } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import Button from "common/components/Button";

import { createSource } from "./sourceSlice";

type SourceCreateProps = ButtonProps;

const SourceCreate = ({ ...buttonProps }: SourceCreateProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleCreateSource = () => dispatch(createSource());

  return (
    <Button
      {...buttonProps}
      color="primary"
      variant="contained"
      onClick={handleCreateSource}
    >
      {t("newSource")}
    </Button>
  );
};

export default SourceCreate;
