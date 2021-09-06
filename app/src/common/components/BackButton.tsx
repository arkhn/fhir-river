import React from "react";

import { ButtonProps } from "@material-ui/core";
import ArrowBack from "@material-ui/icons/ArrowBackIos";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import Button from "./Button";

type BackButtonProps = ButtonProps;

const BackButton = ({ ...buttonProps }: BackButtonProps): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();

  const handleBackClick = () => {
    history.goBack();
  };

  return (
    <Button
      {...buttonProps}
      startIcon={<ArrowBack />}
      onClick={handleBackClick}
      disableRipple
    >
      {t("back")}
    </Button>
  );
};

export default BackButton;
